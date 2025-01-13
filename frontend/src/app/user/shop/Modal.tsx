import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { CourseAction } from '@/types/course'

interface ModalButton {
  label: string;
  action: CourseAction | null;
  description: string | null;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  buttons: ModalButton[];
  onAction: (action: CourseAction) => void;
}

export function Modal({
  isOpen,
  onClose,
  title,
  content,
  buttons,
  onAction
}: ModalProps) {
  const handleAction = (action: CourseAction | null) => {
    if (action) {
      onAction(action);
    } else {
      onClose();
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">閉じる</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                      {title}
                    </Dialog.Title>
                    <div className="mt-4">
                      <p className="text-base text-gray-500">
                        {content}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {buttons.map((button, index) => (
                    <div key={index} className="w-full">
                      <button
                        type="button"
                        className={`w-full rounded-lg px-4 py-3 text-white
                          ${button.action 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-gray-500 hover:bg-gray-600'
                          } 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        onClick={() => handleAction(button.action)}
                      >
                        {button.label}
                      </button>
                      {button.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {button.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}