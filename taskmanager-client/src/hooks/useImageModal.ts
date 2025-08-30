'use client';

import { useState, useCallback } from 'react';

interface ImageData {
	public_id: string;
	url: string;
	width?: number;
	height?: number;
}

interface UseImageModalReturn {
	isOpen: boolean;
	currentIndex: number;
	openModal: (images: ImageData[], index: number) => void;
	closeModal: () => void;
	nextImage: () => void;
	previousImage: () => void;
	images: ImageData[];
}

export function useImageModal(): UseImageModalReturn {
	const [isOpen, setIsOpen] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [images, setImages] = useState<ImageData[]>([]);

	const openModal = useCallback((imageList: ImageData[], index: number) => {
		setImages(imageList);
		setCurrentIndex(index);
		setIsOpen(true);
	}, []);

	const closeModal = useCallback(() => {
		setIsOpen(false);
		setCurrentIndex(0);
		setImages([]);
	}, []);

	const nextImage = useCallback(() => {
		setCurrentIndex((prev) => (prev + 1) % images.length);
	}, [images.length]);

	const previousImage = useCallback(() => {
		setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
	}, [images.length]);

	return {
		isOpen,
		currentIndex,
		openModal,
		closeModal,
		nextImage,
		previousImage,
		images,
	};
}