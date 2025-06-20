"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group"
import { Label } from "@/app/components/ui/label"
import { Settings, Mic, MessageCircle, CreditCard, ArrowRight } from "lucide-react"
// import { useConfigurationStore } from "@/app/stores/configuration"

export default function ConfigurationPage() {
  const router = useRouter()
  const [config, setConfig] = useState({
    aiType: "",
    sound: "",
    usecase: "",
    voice: "",
  })
  // const configStore = useConfigurationStore()

  const handleConfigChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    // switch (key) {
    //   case "aiType":
    //     configStore.setAiType(value)
    //     break
    //   case "sound":
    //     configStore.setSound(value)
    //     break
    //   case "usecase":
    //     configStore.setUsecase(value)
    //     break
    // }
  }

  const isConfigComplete = config.aiType && config.usecase

  const handleContinue = () => {
    if (!isConfigComplete) return

    // Route based on configuration
    const params = new URLSearchParams({
      aiType: config.aiType,
      sound: config.sound,
      usecase: config.usecase,
      voice: config.voice,
    })

    // Route to appropriate agent page based on AI type
    if (config.aiType === "smart") {
      router.push(`/agent/smart?${params.toString()}`)
    } else {
      router.push(`/agent/advance?${params.toString()}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4 dark:bg-gray-900">
      <Card className="w-full max-w-2xl shadow-xl dark:bg-gray-900">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900">
            <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">AI Agent Configuration</CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
            Customize your AI experience by selecting your preferences below
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* AI Type Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-gray-900 flex items-center gap-2 dark:text-white">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              AI Type
            </Label>
            <RadioGroup
              value={config.aiType}
              onValueChange={(value) => handleConfigChange("aiType", value)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <RadioGroupItem value="smart" id="smart" />
                <Label htmlFor="smart" className="flex-1 cursor-pointer">
                  <div className="font-medium">Smart</div>
                  <div className="text-sm text-gray-500">Quick responses, efficient processing</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced" className="flex-1 cursor-pointer">
                  <div className="font-medium">Advanced</div>
                  <div className="text-sm text-gray-500">Complex reasoning, detailed analysis</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Sound Selection */}
          <div className="space-y-4" style={{ display: config.aiType === "smart" ? "block" : "none" }}>
            <Label className="text-lg font-semibold text-gray-900 flex items-center gap-2 dark:text-white">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Voice Type
            </Label>
            <RadioGroup
              value={config.sound}
              onValueChange={(value) => handleConfigChange("sound", value)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                <RadioGroupItem value="woman" id="woman" />
                <Label htmlFor="woman" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Woman
                  </div>
                  <div className="text-sm text-gray-500">Warm, professional female voice</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                <RadioGroupItem value="man" id="man" />
                <Label htmlFor="man" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Man
                  </div>
                  <div className="text-sm text-gray-500">Clear, confident male voice</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Use Case Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-gray-900 flex items-center gap-2 dark:text-white">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Use Case
            </Label>
            <RadioGroup
              value={config.usecase}
              onValueChange={(value) => handleConfigChange("usecase", value)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                <RadioGroupItem value="conversation" id="conversation" />
                <Label htmlFor="conversation" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Conversation
                  </div>
                  <div className="text-sm text-gray-500">General chat and assistance</div>
                </Label>
              </div>
              <div className="items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors" style={{ display: config.aiType === "smart" ? "none" : "flex" }}>
                <RadioGroupItem value="billing" id="billing" />
                <Label htmlFor="billing" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Billing
                  </div>
                  <div className="text-sm text-gray-500">Payment and account support</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Voice Selection */}
          <div className="space-y-4" style={{ display: config.aiType === "advanced" ? "block" : "none" }}>
            <Label className="text-lg font-semibold text-gray-900 flex items-center gap-2 dark:text-white">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Voice Type
            </Label>
            <RadioGroup
              value={config.voice}
              onValueChange={(value) => handleConfigChange("voice", value)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                <RadioGroupItem value="Y5oW6g8hng3zAbclT1hH" id="woman" />
                <Label htmlFor="woman" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Shea
                  </div>
                  <div className="text-sm text-gray-500">Middle Aged alto indonesian</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                <RadioGroupItem value="gP7FRCgEZ8Lr3rnyGgpw" id="man" />
                <Label htmlFor="man" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Andra
                  </div>
                  <div className="text-sm text-gray-500">indonesian javanese male</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                <RadioGroupItem value="c470sxKWDq6tA74TL3yB" id="man" />
                <Label htmlFor="man" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Kennisa
                  </div>
                  <div className="text-sm text-gray-500">female voice over artist</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                <RadioGroupItem value="RWiGLY9uXI70QL540WNd" id="man" />
                <Label htmlFor="man" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Putra
                  </div>
                  <div className="text-sm text-gray-500">Fiery indonesian young man</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                <RadioGroupItem value="iWydkXKoiVtvdn4vLKp9" id="man" />
                <Label htmlFor="man" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Cahaya
                  </div>
                  <div className="text-sm text-gray-500">Trendy young female</div>
                </Label>
              </div>
            </RadioGroup>
          </div>


          {/* Continue Button */}
          <div className="pt-6">
            <Button
              onClick={handleContinue}
              disabled={!isConfigComplete}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to AI Agent
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
