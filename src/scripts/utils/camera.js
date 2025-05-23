export default class Camera {
    #currentStream;
    #streaming = false;
    #width = 640;
    #height = 0;
   
    #videoElement;
    #selectCameraElement;
    #canvasElement;
    #takePictureButton;

    static addNewStream(stream) {
        if (!Array.isArray(window.currentStreams)) {
          window.currentStreams = [stream];
          return;
        }
        window.currentStreams = [...window.currentStreams, stream];
      }
      static stopAllStreams() {
        if (!Array.isArray(window.currentStreams)) {
          window.currentStreams = [];
          return;
        }
        window.currentStreams.forEach((stream) => {
          if (stream.active) {
            stream.getTracks().forEach((track) => track.stop());
          }
        });
      }

      constructor({ video, canvas, cameraSelect = null }) {
        this.#videoElement = video;
        this.#canvasElement = canvas;
        this.#selectCameraElement = cameraSelect;
        
        // Inisialisasi width dari video element
        this.#width = video.offsetWidth || 640;
        this.#height = 0;

        if (this.#selectCameraElement) {
            this.#populateCameraList();
        }
    }
    
      async #populateCameraList() {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
          this.#selectCameraElement.innerHTML = '';
          videoDevices.forEach((device, index) => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Kamera ${index + 1}`;
            this.#selectCameraElement.appendChild(option);
          });
        } catch (error) {
          console.error('Gagal mengambil daftar kamera:', error);
        }
      }
    
      async launch() {
        try {
            Camera.stopAllStreams();
            
            const constraints = {
                video: {
                    width: { ideal: this.#width },
                    height: { ideal: this.#width * 9 / 16 }, // Tambahkan height
                    facingMode: 'environment', // Prioritaskan kamera belakang
                    aspectRatio: 16 / 9
                }
            };

            if (this.#selectCameraElement?.value) {
                constraints.video.deviceId = { exact: this.#selectCameraElement.value };
            }

            this.#currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            Camera.addNewStream(this.#currentStream);
            this.#videoElement.srcObject = this.#currentStream;
            
            // Perbaikan: Gunakan event 'playing' bukan 'onloadedmetadata'
            await new Promise((resolve) => {
                this.#videoElement.onplaying = () => {
                    this.#height = this.#videoElement.videoHeight;
                    this.#width = this.#videoElement.videoWidth;
                    this.#streaming = true;
                    resolve();
                };
                
                // Timeout fallback
                setTimeout(() => {
                    if (!this.#streaming) {
                        this.#height = this.#videoElement.videoHeight || 480;
                        this.#width = this.#videoElement.videoWidth || 640;
                        this.#streaming = true;
                        resolve();
                    }
                }, 1000);
            });

        } catch (error) {
            console.error('Gagal membuka kamera:', error);
            throw error;
        }
    }

      async _toggleCamera() {
        try {
          const cameraBtn = document.getElementById('openCameraBtn');
          const cameraContainer = document.getElementById('cameraContainer');
          
          this._isCameraOpen = !this._isCameraOpen;
          
          if (this._isCameraOpen) {
            cameraBtn.innerHTML = '<i class="fas fa-times"></i> Tutup Kamera';
            cameraContainer.style.display = 'block';
            await this._camera.launch();
          } else {
            cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Buka Kamera';
            cameraContainer.style.display = 'none';
            this._camera.stop();
          }
        } catch (error) {
          console.error('Error toggling camera:', error);
          this.showError('Gagal mengakses kamera: ' + error.message);
        }
      }
    
      stop() {
        if (this.#currentStream) {
            // Hentikan semua track
            this.#currentStream.getTracks().forEach(track => {
                track.stop();
            });
            
            // Hapus reference
            this.#currentStream = null;
        }

        if (this.#videoElement) {
            this.#videoElement.srcObject = null;
        }

        this.#streaming = false;
    }
    
      async takePicture() {
        // Validasi state kamera
        if (!this.#videoElement || !this.#videoElement.srcObject) {
            throw new Error('Video stream tidak tersedia');
        }
    
        // Pastikan video benar-benar playing
        if (this.#videoElement.paused || this.#videoElement.ended) {
            throw new Error('Video stream tidak aktif');
        }
    
        try {
            // Set dimensi canvas
            this.#canvasElement.width = this.#videoElement.videoWidth;
            this.#canvasElement.height = this.#videoElement.videoHeight;
            
            // Ambil context dan clear canvas
            const ctx = this.#canvasElement.getContext('2d');
            ctx.clearRect(0, 0, this.#canvasElement.width, this.#canvasElement.height);
            
            // Capture frame
            ctx.drawImage(
                this.#videoElement,
                0,
                0,
                this.#canvasElement.width,
                this.#canvasElement.height
            );
            
            // Beri sedikit delay untuk memastikan rendering selesai
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Konversi ke base64
            let imageData;
            try {
                imageData = this.#canvasElement.toDataURL('image/jpeg', 0.8);
            } catch (e) {
                console.warn('Gagal dengan kualitas 0.8, mencoba default...');
                imageData = this.#canvasElement.toDataURL('image/jpeg');
            }
            
            // Validasi hasil
            if (!imageData || !imageData.startsWith('data:image/jpeg;base64,')) {
                throw new Error('Format gambar tidak valid');
            }
            
            return imageData;
        } catch (error) {
            console.error('Error saat capture:', {
                error: error.message,
                videoState: {
                    readyState: this.#videoElement?.readyState,
                    paused: this.#videoElement?.paused,
                    ended: this.#videoElement?.ended,
                    width: this.#videoElement?.videoWidth,
                    height: this.#videoElement?.videoHeight
                }
            });
            throw error;
        }
    }
}