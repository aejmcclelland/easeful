interface LabelFilterProps {
	labels: string[];
	activeLabels: string[];
	onToggle: (label: string) => void;
}

export default function LabelFilter({ labels, activeLabels, onToggle }: LabelFilterProps) {
	if (labels.length === 0) {
		return null;
	}

	return (
		<div className='mb-4'>
			<h3 className='text-sm font-medium mb-2'>Filter by labels:</h3>
			<div className='flex flex-wrap gap-2'>
				{labels.map((label) => (
					<button
						key={label}
						onClick={() => onToggle(label)}
						className={`badge badge-lg cursor-pointer transition-colors ${
							activeLabels.includes(label)
								? 'badge-primary'
								: 'badge-outline hover:badge-primary'
						}`}>
						{label}
					</button>
				))}
			</div>
		</div>
	);
}