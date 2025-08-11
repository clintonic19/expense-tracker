
export const Separator = () => {
    return (
        <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center ">
                <div className="w-full border-t border-gray-300 dark:border-gray-800">
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-black/10 text-gray-500 rounded">
                            OR
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}