import { fromEvent, merge } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

class ListSynchronizer {
  private mainListElement: HTMLElement;
  private sideListElement: HTMLElement;
  private isSynchronizing = false; // Flag to prevent circular scrolling

  constructor(mainListElement: HTMLElement, sideListElement: HTMLElement) {
    this.mainListElement = mainListElement;
    this.sideListElement = sideListElement;

    this.generateListItems();
    this.setupScrollSynchronization();
  }

  // Generate items for both lists
  private generateListItems(): void {
    const mainListItems = document.getElementById('main-list-items');
    const sideListItems = document.getElementById('side-list-items');

    if (mainListItems && sideListItems) {
      for (let i = 1; i <= 1000; i++) {
        const mainItem = document.createElement('li');
        mainItem.innerText = `Item ${i}`;
        mainItem.setAttribute('data-index', `${i}`);
        mainListItems.appendChild(mainItem);

        const sideItem = document.createElement('li');
        sideItem.innerText = `Item ${i}`;
        sideItem.setAttribute('data-index', `${i}`);
        sideListItems.appendChild(sideItem);
      }
    }
  }

  // Setup scroll synchronization between the two lists
  private setupScrollSynchronization(): void {
    // Source Observables: Capture scroll events from both lists
    const mainScroll$ = fromEvent(this.mainListElement, 'scroll').pipe(
      map(() => ({ source: 'main', scrollTop: this.mainListElement.scrollTop })),
      debounceTime(50) // Pipeline: Debounce to limit the number of emitted events
    );

    const sideScroll$ = fromEvent(this.sideListElement, 'scroll').pipe(
      map(() => ({ source: 'side', scrollTop: this.sideListElement.scrollTop })),
      debounceTime(50) // Pipeline: Debounce to limit the number of emitted events
    );

    // Sink: Subscribe to the merged scroll events and apply side effects
    merge(mainScroll$, sideScroll$).subscribe(({ source, scrollTop }) => {
      if (this.isSynchronizing) return;
      this.isSynchronizing = true;

      // Side effect: Synchronize the scroll position
      if (source === 'main') {
        this.sideListElement.scrollTop = scrollTop;
      } else {
        this.mainListElement.scrollTop = scrollTop;
      }

      // Reset the synchronization flag after the scroll adjustment
      setTimeout(() => {
        this.isSynchronizing = false;
      }, 0);
    });
  }
}

// Initialize the ListSynchronizer once the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  const mainListElement = document.getElementById('main-list');
  const sideListElement = document.getElementById('side-list');

  if (mainListElement && sideListElement) {
    new ListSynchronizer(mainListElement, sideListElement);
  }
});
