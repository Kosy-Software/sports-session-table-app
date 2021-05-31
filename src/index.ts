import './styles/style.scss';

import { AppMessage, ComponentMessage } from './lib/appMessages';
import { AppState } from './lib/appState';
import { render } from './views/renderState';
import { isValidYoutubeUrl } from './lib/validation';
import { ClientInfo } from '@kosy/kosy-app-api/types';
import { KosyApi } from '@kosy/kosy-app-api';
import { YoutubePlayer } from './player';

module Kosy.Integration.Youtube {
    export class App {
        private state: AppState = { youtubeUrl: 'https://www.youtube.com/embed?v=1skBf6h2ksI', videoState: null };
        private initializer: ClientInfo;
        private currentClient: ClientInfo;
        private player: YoutubePlayer;
        private isApiReady: boolean;

        private kosyApi = new KosyApi<AppState, AppMessage, AppMessage>({
            onClientHasLeft: (clientUuid) => this.onClientHasLeft(clientUuid),
            onReceiveMessageAsClient: (message) => this.processMessage(message),
            onReceiveMessageAsHost: (message) => this.processMessageAsHost(message),
            onRequestState: () => this.getState(),
            onProvideState: (newState: AppState) => this.setState(newState)
        })

        public async start() {
            let initialInfo = await this.kosyApi.startApp();
            this.initializer = initialInfo.clients[initialInfo.initializerClientUuid];
            this.currentClient = initialInfo.clients[initialInfo.currentClientUuid];
            this.state = initialInfo.currentAppState ?? this.state;
            this.isApiReady = false;
            this.setupPlayerScript();
            this.renderComponent();

            window.addEventListener("message", (event: MessageEvent<ComponentMessage>) => {
                this.processComponentMessage(event.data)
            });
        }

        private setupPlayerScript() {
            //Make sure api is loaded before initializing player
            window.onYouTubeIframeAPIReady = () => { this.onYouTubeIframeAPIReady(); };

            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";

            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        private onYouTubeIframeAPIReady() {
            this.isApiReady = true;
            this.player = new YoutubePlayer('', this.initializer.clientUuid == this.currentClient.clientUuid, (cm) => this.processComponentMessage(cm), this.state.time);
            this.renderComponent();
        }

        public setState(newState: AppState) {
            this.state = newState;
            this.renderComponent();
        }

        public getState() {
            return this.state;
        }

        public onClientHasLeft(clientUuid: string) {
            if (clientUuid === this.initializer.clientUuid) {
                if (!this.state.youtubeUrl) {
                    this.kosyApi.stopApp();
                } else {
                    this.kosyApi.relayMessage({ type: 'assign-new-host' });
                }
            }
        }

        public processMessageAsHost(message: AppMessage): AppMessage {
            switch (message.type) {
                case "assign-new-host":
                    this.renderComponent();
                    break;
                default:
                    return message;
            }

            return null;
        }

        public processMessage(message: AppMessage) {
            switch (message.type) {
                case "close-integration":
                    this.kosyApi.stopApp();
                    break;
                case "receive-youtube-video-state":
                    if (this.isApiReady) {
                        this.state.videoState = message.payload.state;
                        this.state.time = message.payload.time;
                        if (this.state.videoState == YT.PlayerState.ENDED) {
                            console.log("Video ended, clearing youtube url");
                            this.state.videoState = null;
                            this.kosyApi.stopApp();
                        }
                        this.renderComponent();
                    }
                    break;
            }
        }

        private processComponentMessage(message: ComponentMessage) {
            switch (message.type) {
                case "close-integration":
                    this.kosyApi.relayMessage({ type: "close-integration" });
                    break;
                case "youtube-video-state-changed":
                    //Notify all other clients that the youtube video state has changed
                    this.kosyApi.relayMessage({ type: "receive-youtube-video-state", payload: message.payload });
                    break;
                default:
                    break;
            }
        }

        //Poor man's react, so we don't need to fetch the entire react library for this tiny app...
        private renderComponent() {
            render({
                videoState: this.state.videoState,
                time: this.state.time,
                currentClient: this.currentClient,
                initializer: this.initializer,
                player: this.player,
                youtubeUrl: this.state.youtubeUrl,
            }, (message) => this.processComponentMessage(message));
        }

        private log(...message: any) {
            console.log(`${this.currentClient?.clientName ?? "New user"} logged: `, ...message);
        }
    }

    new App().start();
}

declare global {
    interface Window {
        onYouTubeIframeAPIReady?: () => void;
    }
}