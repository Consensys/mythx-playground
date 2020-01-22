// BUSINESS OBJECTS

export interface JwtTokensInterface {
    access: string
    refresh: string
}

export interface loginResponse {
    jwtTokens: JwtTokensInterface
    access: string
    refresh: string
}

export interface StatsResponse {
    from: string
    interval: string
    createdAt: string
    type: string
    revision: number
    data: any
}

export interface UsersResponse {
    total: number
    users: Array<Users>
}

interface Users {
    id: string
    createdAt: string
    email: any
    ethAddress: string
    roles: Array<string>
    preferences: any
    termsId: string
}

export interface AnalyzeOptions {
    groupId?: string
    toolName?: string
    noCacheLookup?: boolean
    contractName?: string
    bytecode?: string
    sourceMap?: string
    deployedBytecode?: string
    deployedSourceMap?: string
    mainSource?: string
    sources?: any
    sourceList?: Array<string>
    solcVersion?: string
    analysisMode?: string
}

export interface AnalysisGroups {
    groups: Array<Group>
    total: number
}

export interface Group {
    id: string
    name: string
    createdAt: string
    createdBy: string
    completedAt: string
    progress: number
    status: string
    mainSourceFiles: Array<String>
    numAnalyses: {}
    numVulnerabilities: {}
}
