import { PROPOSAL_STATE } from "../enums/call";

export interface MatchRequest {
    name: string;
    age: number;
    experience: number;
    spokenLanguageIds: number[];

    latitude: number;
    longitude: number;
    searchRadiusKm: number;

    gender: number;

    rate: number;
    rateType: number;

    availableTiming: number;
    availabilityType: number;

    categoryLevelOneId: number;
    categoryLevelTwoId: number;
    categoryLevelThreeId: number;

    searchType: number;
}

export interface MatchResponse {
    matchId: number;

    userId: number;
    name: string;
    age: number;
    experience: number;
    spokenLanguageIds: number[];
    gender: number;

    rate: number;
    rateType: number;

    availableTiming: number;
    availabilityType: number;

    categoryLevelTwo: string;
    categoryLevelThree: string;
}

export interface CallEndResult {
    proposalState: PROPOSAL_STATE;
    user?: {
        mobileNumber: string;
        latitude: number,
        longitude: number
    }
    message: string;
}