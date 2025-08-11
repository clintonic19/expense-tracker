import {Transition} from '@headlessui/react';
import {Fragment, useState} from 'react';

import React from 'react'

const TransitionWrapper = ({children}) => {
  return (
   <Transition
    as={Fragment}
    enter="transition ease-out duration-100"
    enterFrom="opacity-0 scale-95 transform"
    enterTo="opacity-0 scale-100 transform"
    leave="transition ease-in duration-200"
    leaveFrom="opacity-0 scale-100 transform"
    leaveTo="opacity-0 scale-95 transform"
    >
            {children}
   </Transition>
  );
}

export default TransitionWrapper
