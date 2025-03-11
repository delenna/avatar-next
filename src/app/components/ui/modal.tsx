"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { X } from "lucide-react";

export default function ModalComponent({isOpen, setIsOpen, videoUrl}: {isOpen: boolean, setIsOpen: (open: boolean) => void, videoUrl: string}) {
//   const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

//   function openModal() {
//     setIsOpen(true);
//   }

  return (
    <div className="flex items-center justify-center max-h-screen bg-gray-100">
      {/* <button
        onClick={openModal}
        className="px-4 py-2 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700"
      >
        Open Modal
      </button> */}

      <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md" />
        </Transition.Child>

        {/* Fullscreen Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-0">
          <Transition.Child
            as={Fragment}
            enter="transition-transform duration-200"
            enterFrom="scale-95 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="transition-transform duration-200"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-95 opacity-0"
          >
            <Dialog.Panel className="w-full h-full max-w-none max-h-none bg-white rounded-none shadow-lg">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-white shadow-md z-10">
                <h2 className="text-lg font-semibold text-gray-900">Fullscreen Modal</h2>
                <button onClick={closeModal} className="p-2 text-gray-600 hover:text-gray-900">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Iframe */}
              <iframe src={videoUrl} className="w-full h-full border-none" allow="camera; microphone; fullscreen" allowFullScreen></iframe>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
      </Transition>
    </div>
  );
}
