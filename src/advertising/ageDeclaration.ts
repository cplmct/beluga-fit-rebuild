export type AgeDeclaration = 'unknown' | 'adult' | 'under-18' | 'prefer-not';
export interface DeclarationStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function isDeclaration(value: unknown): value is AgeDeclaration {
  return ['unknown', 'adult', 'under-18', 'prefer-not'].includes(value as string);
}

// Only the declaration is persisted, never consent or fitness data. Serializing
// reads as well as writes prevents a returning owner reading behind a late write.
export class AgeDeclarationStore {
  private queues = new Map<string, Promise<unknown>>();
  private deletedOwners = new Set<string>();
  constructor(
    private storage: DeclarationStorage,
    private deletionPending: (owner: string) => Promise<boolean> = async () => false,
  ) {}
  private async checkOwner(owner: string) {
    if (this.deletedOwners.has(owner) || await this.deletionPending(owner) || this.deletedOwners.has(owner)) {
      throw new Error('Advertising declaration is blocked by account deletion cleanup.');
    }
  }
  private serial<T>(owner: string, action: (key: string) => Promise<T>): Promise<T> {
    const previous = this.queues.get(owner) ?? Promise.resolve();
    const result = previous.catch(() => {}).then(() =>
      action(`beluga:advertising-age:v1:${owner}`));
    this.queues.set(owner, result);
    void result.then(() => {
      if (this.queues.get(owner) === result) this.queues.delete(owner);
    }, () => {
      if (this.queues.get(owner) === result) this.queues.delete(owner);
    });
    return result;
  }
  read(owner: string): Promise<AgeDeclaration> {
    return this.serial(owner, async key => {
      await this.checkOwner(owner);
      const raw = await this.storage.getItem(key);
      await this.checkOwner(owner);
      if (raw === null) return 'unknown';
      const value = JSON.parse(raw);
      if (value?.version !== 1 || value.owner !== owner || !isDeclaration(value.declaration)) {
        throw new Error('Invalid advertising age declaration.');
      }
      return value.declaration;
    });
  }
  write(owner: string, declaration: AgeDeclaration): Promise<void> {
    return this.serial(owner, async key => {
      await this.checkOwner(owner);
      await this.storage.setItem(key, JSON.stringify({ version: 1, owner, declaration }));
    });
  }
  remove(owner: string): Promise<void> {
    // Synchronous suppression also covers failed removal and already queued work.
    // Durable suppression across restart uses the existing account cleanup marker.
    this.deletedOwners.add(owner);
    return this.serial(owner, key => this.storage.removeItem(key));
  }
}
