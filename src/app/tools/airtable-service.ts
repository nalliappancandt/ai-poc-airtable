import { buildQuery, buildUrl, prepareQuery, processHttpRequest } from "../utils/utils";

export const callAirtableApi = async (args: { skill: string; yearOfExp: number }): Promise<string[]> => {
    const keyValues = prepareQuery(args.skill);
    if (!keyValues.length || !args.skill) return [];

    const query = buildQuery(keyValues, [args.yearOfExp.toString()]);
    const url = buildUrl(query);
    console.log(url);

    return processHttpRequest(url);
};

export const callAirtableApiMultiSkill = async (args: { skills: string }): Promise<string[]> => {
    const keyValues = prepareQuery(args.skills);
    if (!keyValues.length || !args.skills) return [];

    const query = buildQuery(keyValues);
    const url = buildUrl(query);
    console.log(url);

    return processHttpRequest(url);
};

export const callAirtableApiMultiSkillExp = async (args: { skills: string; yearOfExp: string }): Promise<string[]> => {
    const keyValues = prepareQuery(args.skills);
    if (!keyValues.length || !args.skills) return [];

    const yearOfExpList = args.yearOfExp ? args.yearOfExp.split(',') : ['1'];
    const query = buildQuery(keyValues, yearOfExpList);
    const url = buildUrl(query);
    console.log(url);

    return processHttpRequest(url);
};
