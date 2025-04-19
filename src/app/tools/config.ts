// Tool definition for callAirtableApiTool function
export const callAirtableApiTool = {
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
export const callAirtableApiToolWithMultiSkills = {
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
export const callAirtableApiToolWithMultiSkillsExp = {
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
