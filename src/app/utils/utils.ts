import fieldsKeys from "@/app/utils/fieldKeys";

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;
const tableId = process.env.AIRTABLE_TABLE_ID;
const apiUrl = process.env.AIRTABLE_API_URL;

export const prepareQuery = (skill: string) => {
    const skillsList = skill.includes(',')
        ? skill.split(',').map(s => s.trim())
        : skill.toLowerCase().includes('and')
            ? skill.split('and').map(s => s.trim())
            : [skill.trim()];

    return fieldsKeys.filter(item =>
        skillsList.some(key => item.toLowerCase().includes(key.toLowerCase()))
    );
}

export const buildQuery = (keyValues: string[], yearOfExpList: string[] = ['1']): string => {
    if (keyValues.length === 1) {
        return `filterByFormula=${encodeURIComponent(`{${keyValues[0]}}>=${yearOfExpList[0]}`)}`;
    }
    return `filterByFormula=AND(${keyValues.map((key, index) => encodeURIComponent(`{${key}}>=${yearOfExpList[index] || '1'}`)).join(',')})`;
};

export const buildUrl = (query: string): string => {
    return `${apiUrl}${baseId}/${tableId}?${query}&fields[]=Name`;
};

export const processHttpRequest = async (url: string): Promise<string[]> => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`Error: ${response.status} - ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        return data.records?.map((record: { fields: { Name: string } }) => record.fields.Name.split('|')[0]) || [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};
