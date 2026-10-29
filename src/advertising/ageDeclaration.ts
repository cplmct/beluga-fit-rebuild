export type AgeDeclaration = 'unknown' | 'adult' | 'under-18' | 'prefer-not';
export interface DeclarationStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export function isDeclaration(value: unknown): value is AgeDeclaration {
  return ['unknown', 'adult', 'under-18', 'prefer-not'].includes(value as string);
}

// Only the declaration is persisted, never consent or fitness data. Serializing
// reads as well as writes prevents a returning owner reading behind a late write.
export class AgeDeclarationStore {
  private queues = new Map<string, Promise<unknown>>();
  constructor(private storage: DeclarationStorage) {}
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
      const raw = await this.storage.getItem(key);
      if (raw === null) return 'unknown';
      const value = JSON.parse(raw);
      if (value?.version !== 1 || value.owner !== owner || !isDeclaration(value.declaration)) {
        throw new Error('Invalid advertising age declaration.');
      }
      return value.declaration;
    });
  }
  write(owner: string, declaration: AgeDeclaration): Promise<void> {
    return this.serial(owner, key => this.storage.setItem(key, JSON.stringify({
      version: 1, owner, declaration,
    })));
  }
}
