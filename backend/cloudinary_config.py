import cloudinary
import cloudinary.uploader
import os
from fastapi import UploadFile, HTTPException
from typing import Optional

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET')
)

async def upload_image_to_cloudinary(file: UploadFile, folder: str = "instaclone") -> str:
    """
    Upload an image to Cloudinary and return the URL
    """
    try:
        # Read file content
        contents = await file.read()
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            folder=folder,
            resource_type="image",
            transformation=[
                {'width': 1080, 'height': 1080, 'crop': 'limit'},
                {'quality': 'auto'}
            ]
        )
        
        return result['secure_url']
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")
    finally:
        await file.close()

async def delete_image_from_cloudinary(image_url: str) -> bool:
    """
    Delete an image from Cloudinary
    """
    try:
        # Extract public_id from URL
        parts = image_url.split('/')
        public_id_with_ext = '/'.join(parts[-2:])
        public_id = public_id_with_ext.rsplit('.', 1)[0]
        
        # Delete from Cloudinary
        result = cloudinary.uploader.destroy(public_id)
        return result.get('result') == 'ok'
    except Exception as e:
        print(f"Error deleting image: {str(e)}")
        return False
