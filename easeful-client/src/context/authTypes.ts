// src/context/authTypes.ts
export type User = {
	_id: string;
	name: string;
	email: string;
	avatar?: { url?: string };
};

export type AuthContextType = {
	user: User | null;
	loading: boolean;
	refresh: () => Promise<void>;
	logout: () => Promise<void>;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
};
