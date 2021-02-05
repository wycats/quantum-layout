export async function bootObservers() {
    const mutationObserver = new MutationObserver((list)=>{
        for (let record of list){
            processMutation(record);
        }
    });
    processMutation({
        addedNodes: document.querySelectorAll(".switcher"),
        removedNodes: []
    });
    mutationObserver.observe(document.body, {
        childList: true,
        attributeFilter: [
            "class"
        ],
        attributeOldValue: true,
        subtree: true
    });
}
const SWITCHERS = new WeakMap();
function processMutation(record) {
    for (let node of record.addedNodes){
        setupSwitcher(node);
    }
    for (let node1 of record.removedNodes){
        teardownSwitcher(node1);
    }
}
const SET_RESIZE = new Set();
const switcherResizeObserver = new ResizeObserver((entries)=>{
    for (let entry of entries){
        let switcher = entry.target;
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
                outer: switcher.clientWidth
            });
            switcher.style.setProperty("grid-auto-flow", "row");
        } else {
            switcher.style.setProperty("grid-auto-flow", "column");
        }
        SET_RESIZE.add(switcher);
    }
});
function setupSwitcher(possibleSwitcher) {
    if (!isElement(possibleSwitcher) || !possibleSwitcher.classList.contains("switcher")) {
        return;
    }
    if (SWITCHERS.has(possibleSwitcher)) {
        return;
    }
    console.log("setting up switcher", possibleSwitcher);
    switcherResizeObserver.observe(possibleSwitcher, {
        box: "border-box"
    });
    SWITCHERS.set(possibleSwitcher, switcherResizeObserver);
}
function teardownSwitcher(possibleSwitcher) {
    if (!isElement(possibleSwitcher)) {
        return;
    }
    let observer = SWITCHERS.get(possibleSwitcher);
    if (observer) {
        console.log("tearing down observer");
        observer.unobserve(possibleSwitcher);
    }
}
function isElement(node) {
    return node.nodeType === Node.ELEMENT_NODE;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC9yZXNpemUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJvb3RPYnNlcnZlcnMoKSB7XG4gIGNvbnN0IG11dGF0aW9uT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobGlzdCkgPT4ge1xuICAgIGZvciAobGV0IHJlY29yZCBvZiBsaXN0KSB7XG4gICAgICBwcm9jZXNzTXV0YXRpb24ocmVjb3JkKTtcbiAgICB9XG4gIH0pO1xuXG4gIHByb2Nlc3NNdXRhdGlvbih7XG4gICAgYWRkZWROb2RlczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zd2l0Y2hlclwiKSxcbiAgICByZW1vdmVkTm9kZXM6IFtdLFxuICB9KTtcblxuICBtdXRhdGlvbk9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICBhdHRyaWJ1dGVGaWx0ZXI6IFtcImNsYXNzXCJdLFxuICAgIGF0dHJpYnV0ZU9sZFZhbHVlOiB0cnVlLFxuICAgIHN1YnRyZWU6IHRydWUsXG4gIH0pO1xufVxuXG5jb25zdCBTV0lUQ0hFUlMgPSBuZXcgV2Vha01hcDxFbGVtZW50LCBSZXNpemVPYnNlcnZlcj4oKTtcblxuZnVuY3Rpb24gcHJvY2Vzc011dGF0aW9uKHJlY29yZDoge1xuICBhZGRlZE5vZGVzOiBJdGVyYWJsZTxOb2RlPjtcbiAgcmVtb3ZlZE5vZGVzOiBJdGVyYWJsZTxOb2RlPjtcbn0pIHtcbiAgZm9yIChsZXQgbm9kZSBvZiByZWNvcmQuYWRkZWROb2Rlcykge1xuICAgIHNldHVwU3dpdGNoZXIobm9kZSk7XG4gIH1cblxuICBmb3IgKGxldCBub2RlIG9mIHJlY29yZC5yZW1vdmVkTm9kZXMpIHtcbiAgICB0ZWFyZG93blN3aXRjaGVyKG5vZGUpO1xuICB9XG59XG5cbmNvbnN0IFNFVF9SRVNJWkUgPSBuZXcgU2V0PEhUTUxFbGVtZW50PigpO1xuXG5jb25zdCBzd2l0Y2hlclJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKChlbnRyaWVzKSA9PiB7XG4gIGZvciAobGV0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICBsZXQgc3dpdGNoZXIgPSBlbnRyeS50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG5cbiAgICBpZiAoU0VUX1JFU0laRS5oYXMoc3dpdGNoZXIpKSB7XG4gICAgICBTRVRfUkVTSVpFLmRlbGV0ZShzd2l0Y2hlcik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gU3dpdGNoIHRoZSBncmlkIGJhY2sgdG8gY29sdW1uIG1vZGUsIHNvIHdlIGNhbiBzZWUgd2hldGhlciBpdCBvdmVyZmxvd3MgaW4gY29sdW1uIG1vZGUuIFRoaXNcbiAgICAvLyBpcyB0cmlnZ2VyaW5nIGEgcmVmbG93IGp1c3QgdG8gbWVhc3VyZSwgYnV0IGl0IGFsc28gb25seSBoYXBwZW5zIHdoZW4gdGhlIHNpemUgb2YgdGhlIGJveFxuICAgIC8vIGNoYW5nZXMsIHNvIGhvcGVmdWxseSBpdCdzIG9rLlxuICAgIHN3aXRjaGVyLnN0eWxlLnNldFByb3BlcnR5KFwiZ3JpZC1hdXRvLWZsb3dcIiwgXCJjb2x1bW5cIik7XG5cbiAgICAvLyBJZiB0aGUgZ3JpZCBvdmVyZmxvd3MsIHN3aXRjaCBpdCBpbnRvIHJvdyBtb2RlLlxuICAgIC8vIE90aGVyd2lzZSwgc3dpdGNoIGl0IGludG8gY29sdW1uIG1vZGUuXG4gICAgaWYgKHN3aXRjaGVyLnNjcm9sbFdpZHRoID4gc3dpdGNoZXIuY2xpZW50V2lkdGgpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwib3ZlcmZsb3dcIiwge1xuICAgICAgICBzd2l0Y2hlcixcbiAgICAgICAgaW5uZXI6IHN3aXRjaGVyLnNjcm9sbFdpZHRoLFxuICAgICAgICBvdXRlcjogc3dpdGNoZXIuY2xpZW50V2lkdGgsXG4gICAgICB9KTtcbiAgICAgIHN3aXRjaGVyLnN0eWxlLnNldFByb3BlcnR5KFwiZ3JpZC1hdXRvLWZsb3dcIiwgXCJyb3dcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN3aXRjaGVyLnN0eWxlLnNldFByb3BlcnR5KFwiZ3JpZC1hdXRvLWZsb3dcIiwgXCJjb2x1bW5cIik7XG4gICAgfVxuXG4gICAgU0VUX1JFU0laRS5hZGQoc3dpdGNoZXIpO1xuICB9XG59KTtcblxuZnVuY3Rpb24gc2V0dXBTd2l0Y2hlcihwb3NzaWJsZVN3aXRjaGVyOiBOb2RlKSB7XG4gIGlmIChcbiAgICAhaXNFbGVtZW50KHBvc3NpYmxlU3dpdGNoZXIpIHx8XG4gICAgIXBvc3NpYmxlU3dpdGNoZXIuY2xhc3NMaXN0LmNvbnRhaW5zKFwic3dpdGNoZXJcIilcbiAgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKFNXSVRDSEVSUy5oYXMocG9zc2libGVTd2l0Y2hlcikpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zb2xlLmxvZyhcInNldHRpbmcgdXAgc3dpdGNoZXJcIiwgcG9zc2libGVTd2l0Y2hlcik7XG4gIHN3aXRjaGVyUmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZShwb3NzaWJsZVN3aXRjaGVyLCB7IGJveDogXCJib3JkZXItYm94XCIgfSk7XG4gIFNXSVRDSEVSUy5zZXQocG9zc2libGVTd2l0Y2hlciwgc3dpdGNoZXJSZXNpemVPYnNlcnZlcik7XG59XG5cbmZ1bmN0aW9uIHRlYXJkb3duU3dpdGNoZXIocG9zc2libGVTd2l0Y2hlcjogTm9kZSkge1xuICBpZiAoIWlzRWxlbWVudChwb3NzaWJsZVN3aXRjaGVyKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCBvYnNlcnZlciA9IFNXSVRDSEVSUy5nZXQocG9zc2libGVTd2l0Y2hlcik7XG5cbiAgaWYgKG9ic2VydmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJ0ZWFyaW5nIGRvd24gb2JzZXJ2ZXJcIik7XG4gICAgb2JzZXJ2ZXIudW5vYnNlcnZlKHBvc3NpYmxlU3dpdGNoZXIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzRWxlbWVudChub2RlOiBOb2RlKTogbm9kZSBpcyBFbGVtZW50IHtcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJzQkFBQSxhQUFBO1VBQ0EsZ0JBQUEsT0FBQSxnQkFBQSxFQUFBLElBQUE7aUJBQ0EsTUFBQSxJQUFBLElBQUE7QUFDQSwyQkFBQSxDQUFBLE1BQUE7OztBQUlBLG1CQUFBO0FBQ0Esa0JBQUEsRUFBQSxRQUFBLENBQUEsZ0JBQUEsRUFBQSxTQUFBO0FBQ0Esb0JBQUE7O0FBR0Esb0JBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLElBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUE7QUFDQSx1QkFBQTthQUFBLEtBQUE7O0FBQ0EseUJBQUEsRUFBQSxJQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUE7OztNQUlBLFNBQUEsT0FBQSxPQUFBO1NBRUEsZUFBQSxDQUFBLE1BR0E7YUFDQSxJQUFBLElBQUEsTUFBQSxDQUFBLFVBQUE7QUFDQSxxQkFBQSxDQUFBLElBQUE7O2FBR0EsS0FBQSxJQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0Esd0JBQUEsQ0FBQSxLQUFBOzs7TUFJQSxVQUFBLE9BQUEsR0FBQTtNQUVBLHNCQUFBLE9BQUEsY0FBQSxFQUFBLE9BQUE7YUFDQSxLQUFBLElBQUEsT0FBQTtZQUNBLFFBQUEsR0FBQSxLQUFBLENBQUEsTUFBQTtZQUVBLFVBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQTtBQUNBLHNCQUFBLENBQUEsTUFBQSxDQUFBLFFBQUE7OztBQUlBLFVBQUEsNkZBQUE7QUFDQSxVQUFBLDBGQUFBO0FBQ0EsVUFBQSwrQkFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsRUFBQSxjQUFBLElBQUEsTUFBQTtBQUVBLFVBQUEsZ0RBQUE7QUFDQSxVQUFBLHVDQUFBO1lBQ0EsUUFBQSxDQUFBLFdBQUEsR0FBQSxRQUFBLENBQUEsV0FBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxFQUFBLFFBQUE7QUFDQSx3QkFBQTtBQUNBLHFCQUFBLEVBQUEsUUFBQSxDQUFBLFdBQUE7QUFDQSxxQkFBQSxFQUFBLFFBQUEsQ0FBQSxXQUFBOztBQUVBLG9CQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsRUFBQSxjQUFBLElBQUEsR0FBQTs7QUFFQSxvQkFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUEsY0FBQSxJQUFBLE1BQUE7O0FBR0Esa0JBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQTs7O1NBSUEsYUFBQSxDQUFBLGdCQUFBO1NBRUEsU0FBQSxDQUFBLGdCQUFBLE1BQ0EsZ0JBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxFQUFBLFFBQUE7OztRQUtBLFNBQUEsQ0FBQSxHQUFBLENBQUEsZ0JBQUE7OztBQUlBLFdBQUEsQ0FBQSxHQUFBLEVBQUEsbUJBQUEsR0FBQSxnQkFBQTtBQUNBLDBCQUFBLENBQUEsT0FBQSxDQUFBLGdCQUFBO0FBQUEsV0FBQSxHQUFBLFVBQUE7O0FBQ0EsYUFBQSxDQUFBLEdBQUEsQ0FBQSxnQkFBQSxFQUFBLHNCQUFBOztTQUdBLGdCQUFBLENBQUEsZ0JBQUE7U0FDQSxTQUFBLENBQUEsZ0JBQUE7OztRQUlBLFFBQUEsR0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLGdCQUFBO1FBRUEsUUFBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLEVBQUEscUJBQUE7QUFDQSxnQkFBQSxDQUFBLFNBQUEsQ0FBQSxnQkFBQTs7O1NBSUEsU0FBQSxDQUFBLElBQUE7V0FDQSxJQUFBLENBQUEsUUFBQSxLQUFBLElBQUEsQ0FBQSxZQUFBIn0=