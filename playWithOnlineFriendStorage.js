function encodeData(gameState) {
    const flatData = [
        gameState.myId,
        ...gameState.data[0],
        ...gameState.data[1],
        ...gameState.data[2],
        gameState.isRestart,
        gameState.isUndo
    ];

    return flatData.join(',');
}

function decodeData(encodedGameState) {
    const dataArray = encodedGameState.split(',');

    return {
        myId: dataArray[0] === "null" ? null : dataArray[0],  // Convert 'null' string back to actual null
        data: [
            [dataArray[1], dataArray[2], dataArray[3]],
            [dataArray[4], dataArray[5], dataArray[6]],
            [dataArray[7], dataArray[8], dataArray[9]]
        ],
        isRestart: parseInt(dataArray[10], 10),  // Convert '0' or '1' to integer
        isUndo: parseInt(dataArray[11], 10)     // Convert '0' or '1' to integer
    };
}


const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-0k_Nj_jgmtSza7PVv1_8lnvVbflvIVyVpR5JAoIr9oJBEXufMCKAo8ZHM8DlYKzftw/exec';

function sendTextPost(payload, callback) {
  fetch(SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain'
    },
    body: payload
  })
    .then(response => response.text())
    .then(data => callback(null, data))
    .catch(error => callback(error, null));
}

function createOrOverwriteFile(filename, content) {
  const payload = `action=createOrOverwrite\nfilename=${filename}\ncontent=${content}`;
  sendTextPost(payload, (err, response) => {
    if (err) {
      console.error(`Error creating file ${filename}:`, err);
    } else {
      console.log(`File created or overwritten: ${filename}, Response: ${response}`);
    }
  });
}

function deleteAllFile(filename) {
  const payload = `action=delete\nfilename=${filename}`;
  sendTextPost(payload, (err, response) => {
    if (err) {
      console.error(`Error deleting file ${filename}:`, err);
    } else {
      console.log(`File deleted: ${filename}, Response: ${response}`);
    }
  });
}

function getFileContent(filename) {
  const payload = `action=get\nfilename=${filename}`;
  sendTextPost(payload, (err, response) => {
    if (err) {
      console.error(`Error fetching file content for ${filename}:`, err);
    } else {
      console.log(`File content retrieved: ${filename}, Content: ${response}`);
    }
  });
}
