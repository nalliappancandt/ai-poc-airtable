import ollama from "ollama";
import { NextRequest, NextResponse } from "next/server";
import fieldsKeys from "@/app/utils/fieldKeys";

const prepareQuery = (skill: string) => {
  let skillsList: string[] = [];
  if (skill.includes(',')) {
    skillsList = skill.split(',').map(s => s.trim());
  } else if (skill.toLowerCase().includes('and')) {
    skillsList = skill.split('and').map(s => s.trim());
  } else {
    skillsList = [skill.trim()];
  }

  if (skillsList.length > 1) {
    return fieldsKeys.filter(item => 
      skillsList.some(key => 
        item.toLowerCase().includes(key.toLowerCase())
      )
    );
  } else {
    return fieldsKeys.filter(item => 
      item.toLowerCase().includes(skillsList[0].toLowerCase())
    );
  }
}

async function callAirtableApi(args: { skill: string, yearOfExp: number }): Promise<any> {
  
  const keyValues = prepareQuery(args.skill);
  console.log(keyValues);
  if(keyValues.length == 0 || args.skill == ''){
    return [];
  }
  let query = '';

  if(keyValues.length == 1){
    query += 'filterByFormula='+encodeURI(`{${keyValues}}=${args.yearOfExp ? args.yearOfExp : 1}`);
  }else {
    query+='filterByFormula=AND(';
    const encodedQueries: any[] = [];
    keyValues.forEach((key) => {
      encodedQueries.push(encodeURI(`{${key}}>=1`))
    })
    query += encodedQueries.join(',');
    query +=')';
  }
  
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID; 
  const tableId = process.env.AIRTABLE_TABLE_ID; 
  const url = `${process.env.AIRTABLE_API_URL}${baseId}/${tableId}?${query}&fields[]=Name`;

  console.log(url);

  const options = {
  method: 'GET',
  headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
  }
  };

  return await fetch(url, options)
      .then(response => response.json())
      .then(data => {
      const developers = data.records;
      return developers.map((data: { fields: { [x: string]: any; Name: string; }; }) => `${data.fields.Name.split('|')[0]}`)
      })
      .catch(error => console.error('Error:', error));
 }



  async function callAirtableApiMultiSkill(args: { skills: string}): Promise<any> {
  
    const keyValues = prepareQuery(args.skills);
   
    if(keyValues.length == 0 || args.skills == ''){
      return [];
    }
  
    let query = 'filterByFormula=';
  
    if(keyValues.length == 1){
      query += encodeURI(`{${keyValues}}>=1`);
    } else {
      query+='AND(';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const encodedQueries: any[] = [];
      keyValues.forEach((key) => {
        encodedQueries.push(encodeURI(`{${key}}>=1`))
      })
      query += encodedQueries.join(',');
      query +=')';
    }
    
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID; 
    const tableId = process.env.AIRTABLE_TABLE_ID; 
    const url = `${process.env.AIRTABLE_API_URL}${baseId}/${tableId}?${query}&fields[]=Name`;
  
    console.log(url);
  
    const options = {
    method: 'GET',
    headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    }
    };

  return await fetch(url, options)
      .then(response => response.json())
      .then(data => {
      return data?.records?.map((data: { fields: { [x: string]: any; Name: string; }; }) => `${data.fields.Name.split('|')[0]}`)
      })
      .catch(error => console.error('Error:', error));
}

async function callAirtableApiMultiSkillExp(args: { skills: string, yearOfExp: string}): Promise<any> {
  
  const keyValues = prepareQuery(args.skills);
 
  if(keyValues.length == 0 || args.skills == ''){
    return [];
  }
  const yearOfExpList = args.yearOfExp ? args.yearOfExp?.split(',') : [1];
  let query = 'filterByFormula=';

  if(keyValues.length == 1){
    query += encodeURI(`{${keyValues}}>=${yearOfExpList[0]?yearOfExpList[0] : 1}`);
  } else {
    query='AND(';
    const encodedQueries: any[] = [];
    keyValues.forEach((key, index) => {
      encodedQueries.push(`{${key}}>=${yearOfExpList[index]?yearOfExpList[index] : 1}`);
    })
    query += encodedQueries.join(',');
    query+=')';
  }
  
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID; 
  const tableId = process.env.AIRTABLE_TABLE_ID; 
  const url = `${process.env.AIRTABLE_API_URL}${baseId}/${tableId}?${query}&fields[]=Name`;

  console.log(url);

  const options = {
  method: 'GET',
  headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
  }
  };

return await fetch(url, options)
    .then(response => response.json())
    .then(data => {
    return data?.records?.map((data: { fields: { [x: string]: any; Name: string; }; }) => `${data.fields.Name.split('|')[0]}`)
    })
    .catch(error => console.error('Error:', error));
}

// Tool definition for callAirtableApiTool function
const callAirtableApiTool = {
type: 'function',
function: {
  name: 'callAirtableApi',
  description: 'Search Employee with matching skill set',
  parameters: {
      type: 'object',
      required: ['skill', 'yearOfExp'],
      properties: {
          skill: { type: 'string', description: 'Skill requested' },
          yearOfExp: { type: 'number', description: 'Year of experience' }
      }
  }
}
};

// Tool definition for subtract function
const callAirtableApiToolWithMultiSkills = {
  type: 'function',
  function: {
    name: 'callAirtableApiMultiSkill',
    description: 'Search Employee with matching skills set',
    parameters: {
        type: 'object',
        required: ['skills'],
        properties: {
            skills: { type: 'string', description: 'Comma seprated string of skills' }
        }
    }
  }
  };

// Tool definition for subtract function
const callAirtableApiToolWithMultiSkillsExp = {
  type: 'function',
  function: {
    name: 'callAirtableApiMultiSkillExp',
    description: 'Search Employee with matching skills and experience',
    parameters: {
        type: 'object',
        required: ['skills', 'yearOfExp'],
        properties: {
            skills: { type: 'string', description: 'Comma seprated string of skills' },
            yearOfExp: { type: 'string', description: 'Comma seprated numbers for each skill' }
        }
    }
  }
  };


export async function POST(req: NextRequest) {
  const ollama_model = process.env.OLLAMA_MODEL;
  const { message } = await req.json();

  const messages = [{ role: 'user', content: message }];
  console.log('Prompt:', messages[0].content);
  const availableFunctions = {
    callAirtableApi,
    callAirtableApiMultiSkill,
    callAirtableApiMultiSkillExp
  };
  const response = await ollama.chat({
    model: ollama_model,
    messages,
    tools: [callAirtableApiTool, callAirtableApiToolWithMultiSkills, callAirtableApiToolWithMultiSkillsExp]
  });
  if (response.message.tool_calls) {
    for (const tool of response.message.tool_calls) {
      const functionToCall = availableFunctions[tool.function.name];
      if (functionToCall) {
        console.log('Calling function:', tool.function.name);
        console.log('Arguments:', tool.function.arguments);
        const output = await functionToCall(tool.function.arguments);
        console.log(output)
        messages.push(response.message, { role: 'tool', content: output?.join(',') });
      } else {
        console.log('Function', tool.function.name, 'not found');
      }
    }
    const finalResponse = await ollama.chat({
      model: ollama_model,
      messages
    });
    return NextResponse.json({ message: finalResponse.message.content }, { status: 200 });
  } else {
    console.log('No tool calls returned from model');
    return NextResponse.json({ message: 'No tool calls returned from model' }, { status: 200 });
  }
}
