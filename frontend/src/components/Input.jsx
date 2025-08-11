import React, { forwardRef } from "react";
import clsx from "clsx";

const sizeClasses = {
  default: "h-10 px-3 py-2",
  sm: "h-9 px-3 py-1",
  lg: "h-11 px-4 py-3",
};

// const Input = forwardRef(
//   ({ id, label, error, size = "default", className, register, ...props }, ref) => {
//     return (
//       <div className="space-y-2 w-ful">
//         {label && (
//           <label
//             htmlFor={id}
//             className="block text-sm font-medium text-gray-700 dark:text-gray-500"
//           >
//             {label}
//           </label>
//         )}
//         <input
//           id={id}
//           ref={ref}
//           {...register}
//           className={clsx(
//             "block w-full rounded-md border-gray-300 shadow",
//             "focus:border-indigo-300 focus:ring focus:ring-blue-400 focus:ring-opacity-40",
//             "placeholder-gray-400",
//             "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
//             sizeClasses[size],
//             className
//           )}
//           {...props}
//         />
//         {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
//       </div>
//     );
//   }
// );

// Input.displayName = "Input";

// export default Input;


// NEW CODE UPDATE HERE
// import React from 'react';
// import PropTypes from 'prop-types';
// import clsx from 'clsx';

const Input = React.forwardRef(({
    type, placeholder, label, className, register, name, error }, ref) => {

    return (
        <div className='w-full flex flex-col gap-1'>
            {label && (<label htmlFor={name} className='text-sm text-gray-500'>{label}</label>)}

            <div>
                <input
                    type={type}
                    placeholder={placeholder}
                    name={name}
                    ref={ref}
                    {...register}
                    aria-invalid={error ? "true" : "false"}
                    className={clsx("bg-transparent px-3 py-2.5 2xl:py-3 border border-gray-300 placeholder-gray-300 text-gray-900 outline-none text-base focus:ring-2 ring-orange-300", className)}
                />
            </div>
            {error && (<span className='text-red-500 text-sm'>{error}</span>)}
        </div>
    );
});

// Input.propTypes = {
//     type: PropTypes.string.isRequired,
//     placeholder: PropTypes.string.isRequired,
//     label: PropTypes.string.isRequired,
//     className: PropTypes.string,
//     register: PropTypes.object,
//     name: PropTypes.string.isRequired,
//     error: PropTypes.string,
// };

Input.displayName = 'Input';

export default Input;