import { OBSWebSocket } from 'obs-websocket-js';

class OBSManager {
  constructor() {
    this.obs = new OBSWebSocket();
    this.isConnected = false;
    this.onStateChange = null; // Broadcast callback to all connected clients
    this.setupListeners();
  }

  setupListeners() {
    this.obs.on('ConnectionClosed', () => {
      console.log('[OBS] Disconnected');
      this.isConnected = false;
      this.emitState({ connected: false });
    });

    this.obs.on('ConnectionError', (err) => {
      console.warn('[OBS] Connection Error:', err.message);
      this.isConnected = false;
      this.emitState({ connected: false, error: err.message });
    });

    this.obs.on('CurrentProgramSceneChanged', (data) => {
      this.emitState({ event: 'sceneChanged', currentScene: data.sceneName });
    });

    this.obs.on('InputMuteStateChanged', (data) => {
      this.emitState({ event: 'muteChanged', inputName: data.inputName, inputMuted: data.inputMuted });
    });

    this.obs.on('RecordStateChanged', (data) => {
      this.emitState({ event: 'recordChanged', recording: data.outputActive });
    });

    this.obs.on('StreamStateChanged', (data) => {
      this.emitState({ event: 'streamChanged', streaming: data.outputActive });
    });
  }

  emitState(data) {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(data);
    }
  }

  async connect(address = 'ws://127.0.0.1:4455', password = '') {
    try {
      console.log(`[OBS] Connecting to ${address}...`);
      await this.obs.connect(address, password);
      this.isConnected = true;
      console.log('[OBS] Connected successfully!');
      
      const scenes = await this.getScenes();
      const status = await this.getStatus();

      this.emitState({ 
        connected: true, 
        currentScene: scenes.currentProgramSceneName,
        scenes: scenes.scenes.map(s => s.sceneName),
        ...status
      });

      return { success: true };
    } catch (err) {
      this.isConnected = false;
      console.warn('[OBS] Connect failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.obs.disconnect();
      this.isConnected = false;
    }
  }

  async getScenes() {
    if (!this.isConnected) return { scenes: [], currentProgramSceneName: null };
    try {
      return await this.obs.call('GetSceneList');
    } catch (e) {
      return { scenes: [], currentProgramSceneName: null };
    }
  }

  async setScene(sceneName) {
    if (!this.isConnected) return { success: false, error: 'OBS not connected' };
    try {
      await this.obs.call('SetCurrentProgramScene', { sceneName });
      return { success: true, sceneName };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async toggleMute(inputName) {
    if (!this.isConnected) return { success: false, error: 'OBS not connected' };
    try {
      const res = await this.obs.call('ToggleInputMute', { inputName });
      return { success: true, inputName, muted: res.inputMuted };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async toggleRecord() {
    if (!this.isConnected) return { success: false, error: 'OBS not connected' };
    try {
      const res = await this.obs.call('ToggleRecord');
      return { success: true, recording: res.outputActive };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async toggleStream() {
    if (!this.isConnected) return { success: false, error: 'OBS not connected' };
    try {
      const res = await this.obs.call('ToggleStream');
      return { success: true, streaming: res.outputActive };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async getStatus() {
    if (!this.isConnected) return { recording: false, streaming: false };
    try {
      const rec = await this.obs.call('GetRecordStatus');
      const stream = await this.obs.call('GetStreamStatus');
      return { recording: rec.outputActive, streaming: stream.outputActive };
    } catch (e) {
      return { recording: false, streaming: false };
    }
  }
}

export const obsManager = new OBSManager();
