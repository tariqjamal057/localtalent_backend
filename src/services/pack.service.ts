import { packRepository, PackRepository, MatchCountPack, AdPack } from '../repositories/pack.repository';

export class PackService {
    constructor(private readonly packRepository: PackRepository) { }

    async getMatchCountPacks(onlyActive = true): Promise<MatchCountPack[]> {
        return this.packRepository.getMatchCountPacks(onlyActive);
    }

    async getAdPacks(onlyActive = true): Promise<AdPack[]> {
        return this.packRepository.getAdPacks(onlyActive);
    }
}

export const packService = new PackService(packRepository);
