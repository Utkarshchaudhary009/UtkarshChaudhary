import axios from 'axios';

export async function ElevenLabsTTS(text: string, voiceId: string, config: any,keyDoc:any) {
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_multilingual_v2',
        language_code: 'en',
        voice_settings: config.voiceSettings || {
          stability: 0.3,
          similarity_boost: 0.75
        }
      },
      {
        responseType: 'arraybuffer',
        headers: {
          'xi-api-key': keyDoc.key,
          'Content-Type': 'application/json'
        }
      }
    );
    if (response.status !== 200) {
      throw new Error(`Key "${keyDoc.name}" failed: ${response.data.detail.msg} `);
    }
    if (response.status === 200) {
      const audioBuffer = Buffer.from(response.data);
      return audioBuffer;
    }
  } catch (error: any) {
    throw new Error(`Key "${keyDoc.name}" failed: ${error.message} `);
  }
}
