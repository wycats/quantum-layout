export async function bootObservers() {
  const mutationObserver = new MutationObserver((list) => {
    for (let record of list) {
      processMutation(record);
    }
  });

  processMutation({
    addedNodes: document.querySelectorAll(".switcher"),
    removedNodes: [],
  });

  mutationObserver.observe(document.body, {
    childList: true,
    attributeFilter: ["class"],
    attributeOldValue: true,
    subtree: true,
  });
}

const SWITCHERS = new WeakMap<Element, ResizeObserver>();

function processMutation(record: {
  addedNodes: Iterable<Node>;
  removedNodes: Iterable<Node>;
}) {
  for (let node of record.addedNodes) {
    setupSwitcher(node);
  }

  for (let node of record.removedNodes) {
    teardownSwitcher(node);
  }
}

const SET_RESIZE = new Set<HTMLElement>();

const switcherResizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    let switcher = entry.target as HTMLElement;

    if (SET_RESIZE.has(switcher)) {
      SET_RESIZE.delete(switcher);
      return;
    }

    // Switch the grid back to column mode, so we can see whether it overflows in column mode. This
    // is triggering a reflow just to measure, but it also only happens when the size of the box
    // changes, so hopefully it's ok.
    switcher.style.setProperty("grid-auto-flow", "column");

    // If the grid overflows, switch it into row mode.
    // Otherwise, switch it into column mode.
    if (switcher.scrollWidth > switcher.clientWidth) {
      console.log("overflow", {
        switcher,
        inner: switcher.scrollWidth,
        outer: switcher.clientWidth,
      });
      switcher.style.setProperty("grid-auto-flow", "row");
    } else {
      switcher.style.setProperty("grid-auto-flow", "column");
    }

    SET_RESIZE.add(switcher);
  }
});

function setupSwitcher(possibleSwitcher: Node) {
  if (
    !isElement(possibleSwitcher) ||
    !possibleSwitcher.classList.contains("switcher")
  ) {
    return;
  }

  if (SWITCHERS.has(possibleSwitcher)) {
    return;
  }

  console.log("setting up switcher", possibleSwitcher);
  switcherResizeObserver.observe(possibleSwitcher, { box: "border-box" });
  SWITCHERS.set(possibleSwitcher, switcherResizeObserver);
}

function teardownSwitcher(possibleSwitcher: Node) {
  if (!isElement(possibleSwitcher)) {
    return;
  }

  let observer = SWITCHERS.get(possibleSwitcher);

  if (observer) {
    console.log("tearing down observer");
    observer.unobserve(possibleSwitcher);
  }
}

function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}
