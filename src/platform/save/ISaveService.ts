export interface ISaveService<TSnapshot> {
  load(): Promise<TSnapshot | null>;
  save(snapshot: TSnapshot): Promise<void>;
  clear(): Promise<void>;
}
