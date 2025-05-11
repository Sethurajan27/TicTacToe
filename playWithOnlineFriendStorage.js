// Cache the SCRIPT_URL and common strings
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbylygkfLD9ykHJc2u_7FdsEaXtm2_Qb90JP-zKMPbC793xwqksbim9p5dI4fYrpmbTemA/exec';
const CONTENT_TYPE = 'text/plain';
const COMMA = ',';
const NEWLINE = '\n';

// Pre-allocate arrays and objects for reuse
const EMPTY_BOARD = [
  ['', '', ''],
  ['', '', ''],
  ['', '', '']
];
const EMPTY_STATE = {
  id: null,
  data: EMPTY_BOARD,
  isRestart: 0,
  isUndo: 0
};

// Optimize encodeData for maximum speed
function encodeData(gameState) {
  // Use string concatenation instead of array join for better performance
  return gameState.id + COMMA +
    gameState.data[0][0] + COMMA +
    gameState.data[0][1] + COMMA +
    gameState.data[0][2] + COMMA +
    gameState.data[1][0] + COMMA +
    gameState.data[1][1] + COMMA +
    gameState.data[1][2] + COMMA +
    gameState.data[2][0] + COMMA +
    gameState.data[2][1] + COMMA +
    gameState.data[2][2] + COMMA +
    gameState.isRestart + COMMA +
    gameState.isUndo;
}

// Optimize decodeData for maximum speed
function decodeData(encodedGameState) {
  // Use string split with limit for better performance
  const dataArray = encodedGameState.split(COMMA, 12);

  // Create new state object with pre-allocated arrays
  const state = {
    id: dataArray[0] === "null" ? null : dataArray[0],
    data: [
      [dataArray[1], dataArray[2], dataArray[3]],
      [dataArray[4], dataArray[5], dataArray[6]],
      [dataArray[7], dataArray[8], dataArray[9]]
    ],
    isRestart: dataArray[10] | 0,
    isUndo: dataArray[11] | 0
  };

  return state;
}

// Optimize sendTextPost for maximum speed
function sendTextPost(payload, callback) {
  fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': CONTENT_TYPE },
    body: payload,
    keepalive: true,
    priority: 'high'
  })
    .then(response => response.text())
    .then(data => callback(null, data))
    .catch(error => callback(error, null));
}

// Optimize createFile for maximum speed
function createFile(filename, content) {
  const payload = `action=create${NEWLINE}filename=${filename}${NEWLINE}content=${content}`;
  sendTextPost(payload, (err) => {
    if (err) console.error(`Error creating file ${filename}:`, err);
  });
}

// Optimize createFile for maximum speed
function updateFile(filename, content) {
  const payload = `action=update${NEWLINE}filename=${filename}${NEWLINE}content=${content}`;
  sendTextPost(payload, (err) => {
    if (err) console.error(`Error updating file ${filename}:`, err);
  });
}
// Optimize deleteAllFile for maximum speed
function deleteAllFile(filename) {
  const payload = `action=delete${NEWLINE}filename=${filename}`;
  sendTextPost(payload, (err) => {
    if (err) console.error(`Error deleting file ${filename}:`, err);
  });
}

// Optimize getFileContent for maximum speed
async function getFileContent(filename) {
  try {
    const payload = `action=get${NEWLINE}filename=${filename}`;
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': CONTENT_TYPE },
      body: payload,
      keepalive: true,
      priority: 'high'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.text();

  } catch (error) {
    return null;
  }
}

// Add a function to check if the game state is valid
function isValidGameState(state) {
  return state &&
    state.data &&
    state.data.length === 3 &&
    state.data.every(row => row.length === 3);
}

// Add a function to create a new game state
function createNewGameState(id) {
  return {
    id: id,
    data: JSON.parse(JSON.stringify(EMPTY_BOARD)), // Deep copy
    isRestart: 0,
    isUndo: 0
  };
}
