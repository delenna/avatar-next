import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ConfigurationState {
    aiType: string;
    sound: string;
    usecase: string;
    setAiType: (aiType: string) => void;
    setSound: (sound: string) => void;
    setUsecase: (usecase: string) => void;
}

export const useConfigurationStore = create<ConfigurationState>()(
    devtools((set) => ({
    aiType: "",
    sound: "",
    usecase: "",
    setAiType: (aiType: string) => set({ aiType }),
    setSound: (sound: string) => set({ sound }),
    setUsecase: (usecase: string) => set({ usecase }),
})));
