const path = require('path');
const fs = require('fs');

const getImage = (folder, name) => {
  const imagePath = path.join(__dirname, '..','public', 'uploads', folder, name);
  return new Promise((resolve, reject) => {
    fs.access(imagePath, fs.constants.F_OK, (err) => {
      if (err) {
        reject('Image not found');
      } else {
        resolve(imagePath);
      }
    });
  });
};

module.exports = {
  getImage,
};
