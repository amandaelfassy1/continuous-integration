import { GetObjectCommandInput, PutObjectCommandInput, S3 } from "@aws-sdk/client-s3";

import { Readable } from 'stream';
import { ApiError } from "./Error/ApiError";
import { ErrorCode } from "./Error/ErrorCode";

process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "SCW24KX103VA9P75T878";
process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "b0bef72f-d281-4545-ac91-b38a7e60fb36";

const REGION = process.env.STORAGE_REGION || "fr-par";
const ENDPOINT = process.env.STORAGE_ENDPOINT || "https://s3.fr-par.scw.cloud";
const BUCKET = process.env.STORAGE_BUCKET || "object-storage-playground";

/**
 * Classe wrapper pour un service de stockage d'objet cloud. Cette classe utilise le protocole Amazon S3, mais
 * on pourrait le remplacer avec un autre service (exemple Firebase) si on veux.
 * @todo Pour l'instant on envoie et récupère des fichiers. Idéalement on complétera avec d'autre fonctions comme: lister les fichiers, récupérer juste le meta-data des fichiers, tester l'existence d'un fichier, etc.
 */
export class ObjectStorage {
  
  static async upload(buffer: Buffer, key: string, mimetype?: string): Promise<string> {
    const bareBonesS3 = new S3({
      region: REGION,
      endpoint: ENDPOINT           
    });


    const uploadParams: PutObjectCommandInput = {
      Bucket: BUCKET,
      ACL: "public-read",
      Key: key,
      Body: buffer,
      ContentType: mimetype
    }

    console.log("Uploading file to " + BUCKET + " with key " + key);
    const result = await bareBonesS3.putObject(uploadParams);

    if (result.$metadata.httpStatusCode !== 200) {
      throw new ApiError(ErrorCode.InternalError, 'object/invalid-multipart', "Error transmitting file to object storage", result);
    }

    return key;
  }

  static async download(key: string): Promise<Readable> {

    const bareBonesS3 = new S3({
      region: REGION,
      endpoint: ENDPOINT
    });

    const downloadParams: GetObjectCommandInput = {
      Bucket: BUCKET,
      Key: key 
    }

    const result = await bareBonesS3.getObject(downloadParams);
    return result.Body as Readable;

  }

}