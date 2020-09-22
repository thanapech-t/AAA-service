export function chunk(array: any[], size: number): any[][] {
    // https://medium.com/@Dragonza/four-ways-to-chunk-an-array-e19c889eac4
    if (!array) {
        return [];
    }
    const firstChunk = array.slice(0, size);
    if (!firstChunk.length) {
        return array;
    }
    return [firstChunk].concat(
        this.chunk(array.slice(size, array.length), size),
    );
}
