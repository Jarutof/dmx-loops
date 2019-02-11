export class BytesList {
    array: Uint8Array;
    blockSize: number = 256;
    count: number = 0;
    add(byte: number) {
      if (this.count == this.array.length) {
        const newArray = new Uint8Array(this.array.length + this.blockSize);
        newArray.set(this.array, 0);
        this.array = newArray;
      }
      this.array[this.count++] = byte;
    }
    addGange(arr: Uint8Array) {
      if (this.count + arr.length >= this.array.length) {
        const newArray = new Uint8Array(this.array.length + Math.ceil(arr.length / this.blockSize) * this.blockSize);
        newArray.set(this.array, 0);
        this.array = newArray;
      }
      this.array.set(arr, this.count);
      this.count += arr.length;
    }
    insert(byte: number, index: number) {
      if (this.count == this.array.length) {
        const newArray = new Uint8Array(this.array.length + this.blockSize);
        newArray.set(this.array, 0);
        this.array = newArray;
      }
      this.array.set(this.array.slice(index, this.count++), index + 1);
      this.array[index] = byte;
    }
    insertRange(arr: Uint8Array, index: number) {
      if (this.count + arr.length >= this.array.length) {
        const newArray = new Uint8Array(this.array.length + Math.ceil(arr.length / this.blockSize) * this.blockSize);
        newArray.set(this.array, 0);
        this.array = newArray;
      }
      this.array.set(this.array.slice(index, this.count), index + arr.length);
      this.array.set(arr, index);
      this.count += arr.length;
    }
    toArray(): Uint8Array {
      return this.array.slice(0, this.count);
    }
    constructor() {
      this.array = new Uint8Array(this.blockSize);
    }
  }
