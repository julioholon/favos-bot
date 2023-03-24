module.exports = {shuffle, chunk};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    //skip members that are bots
    if (array[i].user.bot) continue;
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function chunk(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}