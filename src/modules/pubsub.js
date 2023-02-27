const events = {};

function subscribe(tag, newFunction) {
  // If tag already exists, nothing changes. If tag is new, this will set the tag's value to an empty array
  events[tag] = events[tag] || [];
  // Not checking for duplicates of same function - is this something that would be useful in certain cases?
  events[tag].push(newFunction);
}

function unsubscribe(tag, functionToRemove) {
  if (events[tag]) {
    events[tag] = events[tag].filter(function (currentFunction) {
      return currentFunction !== functionToRemove;
    });
  }
}

function publish(tag, data) {
  if (events[tag]) {
    events[tag].forEach((currentFunction) => {
      currentFunction(data);
    });
  }
}

export { subscribe, unsubscribe, publish };
