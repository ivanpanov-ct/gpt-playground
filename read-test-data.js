const fs = require('fs');
const path = require('path');

function readFilesFromFolder(directory) {
    const fileContents = [];

    let fileNumber = 1;

    while (true) {
        const filePath = path.join(directory, `${fileNumber}.txt`);

        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            fileContents.push(content);
            fileNumber++;
        } else {
            break;
        }
    }
    
    return fileContents;
}

module.exports = readFilesFromFolder;