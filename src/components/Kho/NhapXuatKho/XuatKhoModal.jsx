export default function XuatKhoModal({ open, onClose }) {
    return (
        <div className={`${open ? 'block' : 'hidden'} absolute top-0 left-0 h-full w-full bg-black/50 z-[9999] flex items-center justify-center`}>
            <div className="p-3 bg-white">
                <p>Xuất kho</p>

                <button onClick={() => onClose()}>Đóng</button>
            </div>
        </div>
    )
}