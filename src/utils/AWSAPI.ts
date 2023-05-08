class AWSAPISingelton {
  async saveFile(file: File, passwordHash: string) {
    const filename = encodeURIComponent(file.name);
    const fileType = encodeURIComponent(file.type);

    const res = await fetch(
      `/api/upload?file=${filename}&fileType=${fileType}&p=${passwordHash}`
    );
    const { url, fields } = await res.json();
    const formData = new FormData();

    Object.entries({ ...fields, file }).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    const upload = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (upload.ok) {
      console.log("Uploaded successfully!");
    } else {
      console.error("Upload failed.");
    }
  }

  async getFileUrl(fileName: string, passwordHash: string): Promise<string> {
    const res = await fetch(`/api/request?file=${fileName}&p=${passwordHash}`);
    const { url } = await res.json();
    return url;
  }
}
export const AWSAPI = new AWSAPISingelton();
