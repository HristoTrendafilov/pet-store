export class WaitHandle {
  private resolveCollection: (() => void)[] = [];

  release() {
    if (this.resolveCollection.length === 0) {
      throw new Error('WaitHandle: There was nothing to release!');
    }

    for (const resolve of this.resolveCollection) {
      resolve();
    }
    this.resolveCollection = [];
  }

  wait(): Promise<void> {
    return new Promise((resolve) => {
      this.resolveCollection.push(resolve);
    });
  }
}
