export interface User {
  id: number
  nfcUid: string
  name: string
  gender?: string
  dateOfBirth: Date
  birthPlace?: string
  createdAt: Date
  updatedAt: Date
}

export interface Fortune {
  id: number
  userId: number
  fortuneDate: Date
  overallRating: number
  healthFortune: string
  healthSuggestion: string
  wealthFortune: string
  interpersonalFortune: string
  luckyColor: string
  actionSuggestion: string
  rawAiResponse?: any
  createdAt: Date
}

export interface CreateUserRequest {
  nfcUid: string
  name: string
  gender?: string
  dateOfBirth: string
  birthPlace?: string
}

export interface FortuneResponse {
  success: boolean
  data?: Fortune
  error?: string
  code?: string
}