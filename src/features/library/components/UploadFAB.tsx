'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface UploadFABProps {
    onClick: () => void;
}

export default function UploadFAB({ onClick }: UploadFABProps) {
    return (
        <button className="upload-fab" type="button" onClick={onClick}>
            <Plus size={22} />
        </button>
    );
}
