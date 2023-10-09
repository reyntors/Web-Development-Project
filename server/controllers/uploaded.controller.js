const User = require('../models/user.model')
const Lot = require("../models/lot.model");
const path = require('path');
const fs = require('fs');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = new S3Client({ region: process.env.AWS_REGION });

exports.retrieveAttachmentFile = async (req, res, next) => {

  try {

         const { id, filename } = req.params;
        
        const user = await User.findOne({ userId: id });

        if (!user) {
            return res.status(404).json({
              message: 'User not found or you do not have permission to retrieve a file for this user.',
            });
          }

           // Specify the path to the uploaded file
         const filePath = path.join(__dirname, '..', 'public', 'uploads','attachments', filename );
    
           // Check if the file exist
            if (fs.existsSync(filePath)) {
            // Serve the file using Express's res.sendFile()
            res.sendFile(filePath);
            } else {
            res.status(404).json({ message: 'File not found' });
            }

    
  } catch (error) {
    return next(error);
  }

}

exports.retrieveForm = async (req, res, next) => {

  try {

         const { id, filename } = req.params;

         console.log(filename)
        
        const user = await User.findOne({ userId: id });

        if (!user) {
            return res.status(404).json({
              message: 'User not found or you do not have permission to retrieve a file for this user.',
            });
          }

           // Specify the path to the uploaded file
         const filePath = path.join(__dirname, '..', 'public', 'templates', filename);
    
           // Check if the file exist
            if (fs.existsSync(filePath)) {
            // Serve the file using Express's res.sendFile()
            res.sendFile(filePath);
            } else {
            res.status(404).json({ message: 'File not found' });
            }

    
  } catch (error) {
    return next(error);
  }

}


exports.retrieveLotImage = async (req, res) => {

  try {

      const { lotNumber, filename } = req.params;

      const lot = await Lot.findOne({ "subdivision.lotNumber": lotNumber })

      if (!lot) {

          return res.status(404).json({message: 'lot  not found'});
      }

      const arr = lotNumber - 1; 

      let foundImage = null;

      for (const imageObj of lot.subdivision[arr].image) {

        if (imageObj.filename === filename) {
          foundImage = imageObj;
          break; 
        }
      }

      if (foundImage) {
        
        // Send the image URL as part of the response
      return res.status(200).json({ imageUrl: foundImage.url });

        
      } else{
        return res.status(404).json({message: 'Image not found'})
      }
      
  } catch (error) {
    console.log(error);

      return res.status(500).json({ error: 'Internal server error' });
      
  }

}
