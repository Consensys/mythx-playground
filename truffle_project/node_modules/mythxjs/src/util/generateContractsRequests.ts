import { AnalyzeOptions } from '..'

export function generateBytecodeRequest(bytecode: string, toolName: string = 'MythxJS') {
    return {
        clientToolName: toolName,
        data: {
            bytecode: `${bytecode}`,
        },
    }
}

export function generateSourceCodeRequest(sourceCode: string, contractName: string, toolName: string = 'MythxJS') {
    return {
        clientToolName: toolName,
        data: {
            contractName: contractName,
            sources: {
                [`${contractName}.sol`]: {
                    source: sourceCode,
                },
            },
            mainSource: `${contractName}.sol`,
        },
    }
}

export function generateAnalysisRequest(options: AnalyzeOptions, toolName: string = 'MythXJS') {
    if (options.toolName) {
        toolName = options.toolName
    }
    let result: { [k: string]: any } = {
        clientToolName: toolName,
        noCacheLookup: options.noCacheLookup === undefined ? false : options.noCacheLookup,
        data: {},
    }
    if (typeof options.contractName !== 'undefined') result.data['contractName'] = options.contractName
    if (typeof options.bytecode !== 'undefined') result.data['bytecode'] = options.bytecode
    if (typeof options.sourceMap !== 'undefined') result.data['sourceMap'] = options.sourceMap
    if (typeof options.deployedBytecode !== 'undefined') result.data['deployedBytecode'] = options.deployedBytecode
    if (typeof options.deployedSourceMap !== 'undefined') result.data['deployedSourceMap'] = options.deployedSourceMap
    if (typeof options.mainSource !== 'undefined') result.data['mainSource'] = options.mainSource
    if (typeof options.sources !== 'undefined') result.data['sources'] = options.sources
    if (typeof options.sourceList !== 'undefined') result.data['sourceList'] = options.sourceList
    if (typeof options.solcVersion !== 'undefined') result.data['version'] = options.solcVersion
    if (typeof options.analysisMode !== 'undefined') result.data['analysisMode'] = options.analysisMode
    if (typeof options.analysisMode !== 'undefined') result['groupId'] = options.groupId
    return result
}
