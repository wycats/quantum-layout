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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC1zcmMvYm9vdHN0cmFwL3Jlc2l6ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgYXN5bmMgZnVuY3Rpb24gYm9vdE9ic2VydmVycygpIHtcbiAgY29uc3QgbXV0YXRpb25PYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKChsaXN0KSA9PiB7XG4gICAgZm9yIChsZXQgcmVjb3JkIG9mIGxpc3QpIHtcbiAgICAgIHByb2Nlc3NNdXRhdGlvbihyZWNvcmQpO1xuICAgIH1cbiAgfSk7XG5cbiAgcHJvY2Vzc011dGF0aW9uKHtcbiAgICBhZGRlZE5vZGVzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnN3aXRjaGVyXCIpLFxuICAgIHJlbW92ZWROb2RlczogW10sXG4gIH0pO1xuXG4gIG11dGF0aW9uT2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgIGF0dHJpYnV0ZUZpbHRlcjogW1wiY2xhc3NcIl0sXG4gICAgYXR0cmlidXRlT2xkVmFsdWU6IHRydWUsXG4gICAgc3VidHJlZTogdHJ1ZSxcbiAgfSk7XG59XG5cbmNvbnN0IFNXSVRDSEVSUyA9IG5ldyBXZWFrTWFwPEVsZW1lbnQsIFJlc2l6ZU9ic2VydmVyPigpO1xuXG5mdW5jdGlvbiBwcm9jZXNzTXV0YXRpb24ocmVjb3JkOiB7XG4gIGFkZGVkTm9kZXM6IEl0ZXJhYmxlPE5vZGU-O1xuICByZW1vdmVkTm9kZXM6IEl0ZXJhYmxlPE5vZGU-O1xufSkge1xuICBmb3IgKGxldCBub2RlIG9mIHJlY29yZC5hZGRlZE5vZGVzKSB7XG4gICAgc2V0dXBTd2l0Y2hlcihub2RlKTtcbiAgfVxuXG4gIGZvciAobGV0IG5vZGUgb2YgcmVjb3JkLnJlbW92ZWROb2Rlcykge1xuICAgIHRlYXJkb3duU3dpdGNoZXIobm9kZSk7XG4gIH1cbn1cblxuY29uc3QgU0VUX1JFU0laRSA9IG5ldyBTZXQ8SFRNTEVsZW1lbnQ-KCk7XG5cbmNvbnN0IHN3aXRjaGVyUmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKGVudHJpZXMpID0-IHtcbiAgZm9yIChsZXQgZW50cnkgb2YgZW50cmllcykge1xuICAgIGxldCBzd2l0Y2hlciA9IGVudHJ5LnRhcmdldCBhcyBIVE1MRWxlbWVudDtcblxuICAgIGlmIChTRVRfUkVTSVpFLmhhcyhzd2l0Y2hlcikpIHtcbiAgICAgIFNFVF9SRVNJWkUuZGVsZXRlKHN3aXRjaGVyKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBTd2l0Y2ggdGhlIGdyaWQgYmFjayB0byBjb2x1bW4gbW9kZSwgc28gd2UgY2FuIHNlZSB3aGV0aGVyIGl0IG92ZXJmbG93cyBpbiBjb2x1bW4gbW9kZS4gVGhpc1xuICAgIC8vIGlzIHRyaWdnZXJpbmcgYSByZWZsb3cganVzdCB0byBtZWFzdXJlLCBidXQgaXQgYWxzbyBvbmx5IGhhcHBlbnMgd2hlbiB0aGUgc2l6ZSBvZiB0aGUgYm94XG4gICAgLy8gY2hhbmdlcywgc28gaG9wZWZ1bGx5IGl0J3Mgb2suXG4gICAgc3dpdGNoZXIuc3R5bGUuc2V0UHJvcGVydHkoXCJncmlkLWF1dG8tZmxvd1wiLCBcImNvbHVtblwiKTtcblxuICAgIC8vIElmIHRoZSBncmlkIG92ZXJmbG93cywgc3dpdGNoIGl0IGludG8gcm93IG1vZGUuXG4gICAgLy8gT3RoZXJ3aXNlLCBzd2l0Y2ggaXQgaW50byBjb2x1bW4gbW9kZS5cbiAgICBpZiAoc3dpdGNoZXIuc2Nyb2xsV2lkdGggPiBzd2l0Y2hlci5jbGllbnRXaWR0aCkge1xuICAgICAgY29uc29sZS5sb2coXCJvdmVyZmxvd1wiLCB7XG4gICAgICAgIHN3aXRjaGVyLFxuICAgICAgICBpbm5lcjogc3dpdGNoZXIuc2Nyb2xsV2lkdGgsXG4gICAgICAgIG91dGVyOiBzd2l0Y2hlci5jbGllbnRXaWR0aCxcbiAgICAgIH0pO1xuICAgICAgc3dpdGNoZXIuc3R5bGUuc2V0UHJvcGVydHkoXCJncmlkLWF1dG8tZmxvd1wiLCBcInJvd1wiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3dpdGNoZXIuc3R5bGUuc2V0UHJvcGVydHkoXCJncmlkLWF1dG8tZmxvd1wiLCBcImNvbHVtblwiKTtcbiAgICB9XG5cbiAgICBTRVRfUkVTSVpFLmFkZChzd2l0Y2hlcik7XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiBzZXR1cFN3aXRjaGVyKHBvc3NpYmxlU3dpdGNoZXI6IE5vZGUpIHtcbiAgaWYgKFxuICAgICFpc0VsZW1lbnQocG9zc2libGVTd2l0Y2hlcikgfHxcbiAgICAhcG9zc2libGVTd2l0Y2hlci5jbGFzc0xpc3QuY29udGFpbnMoXCJzd2l0Y2hlclwiKVxuICApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoU1dJVENIRVJTLmhhcyhwb3NzaWJsZVN3aXRjaGVyKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnNvbGUubG9nKFwic2V0dGluZyB1cCBzd2l0Y2hlclwiLCBwb3NzaWJsZVN3aXRjaGVyKTtcbiAgc3dpdGNoZXJSZXNpemVPYnNlcnZlci5vYnNlcnZlKHBvc3NpYmxlU3dpdGNoZXIsIHsgYm94OiBcImJvcmRlci1ib3hcIiB9KTtcbiAgU1dJVENIRVJTLnNldChwb3NzaWJsZVN3aXRjaGVyLCBzd2l0Y2hlclJlc2l6ZU9ic2VydmVyKTtcbn1cblxuZnVuY3Rpb24gdGVhcmRvd25Td2l0Y2hlcihwb3NzaWJsZVN3aXRjaGVyOiBOb2RlKSB7XG4gIGlmICghaXNFbGVtZW50KHBvc3NpYmxlU3dpdGNoZXIpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGV0IG9ic2VydmVyID0gU1dJVENIRVJTLmdldChwb3NzaWJsZVN3aXRjaGVyKTtcblxuICBpZiAob2JzZXJ2ZXIpIHtcbiAgICBjb25zb2xlLmxvZyhcInRlYXJpbmcgZG93biBvYnNlcnZlclwiKTtcbiAgICBvYnNlcnZlci51bm9ic2VydmUocG9zc2libGVTd2l0Y2hlcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNFbGVtZW50KG5vZGU6IE5vZGUpOiBub2RlIGlzIEVsZW1lbnQge1xuICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5U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