
import { AnalysisResult } from "../types";

const DB_NAME = "GeoSpyDB";
const STORE_NAME = "analyses";
const DB_VERSION = 1;

export interface DBRecord {
  hash: string;
  result: AnalysisResult;
  base64: string;
  timestamp: number;
}

export class GeoSpyDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "hash" });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = () => reject("Error al abrir IndexedDB");
    });
  }

  /**
   * Genera un hash SHA-256 único para una cadena de datos (base64)
   */
  async generateHash(data: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async saveAnalysis(hash: string, result: AnalysisResult, base64: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      // Guardamos el objeto completo incluyendo la imagen
      const request = store.put({ hash, result, base64, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject("Error al guardar en DB");
    });
  }

  async getAnalysis(hash: string): Promise<AnalysisResult | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(hash);

      request.onsuccess = () => resolve(request.result ? request.result.result : null);
      request.onerror = () => reject("Error al leer de DB");
    });
  }

  async getAllAnalyses(): Promise<DBRecord[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as DBRecord[];
        // Devolvemos ordenados por fecha descendente
        resolve(results.sort((a, b) => b.timestamp - a.timestamp));
      };
      request.onerror = () => reject("Error al recuperar biblioteca");
    });
  }
}

export const dbService = new GeoSpyDB();
