
"""Worker model helper: import CNN and provide a loader utility.

This module fixes the incorrect import and exposes a `load_model`
helper that constructs the `CNN` from `model_def`, loads weights if
provided, moves the model to the appropriate device, and sets eval
mode.
"""

from .model_def import CNN

def load_model(weights_path: str, device=None):
	"""Create a CNN instance, optionally load weights, and return it in eval mode.

	weights_path: path to a PyTorch checkpoint (state_dict or full checkpoint)
	device: torch.device or string (e.g. 'cpu' or 'cuda'); if None, auto-select.
	"""
	import torch
	from collections import OrderedDict

	if device is None:
		device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
	else:
		device = torch.device(device)

	model = CNN()
	model.to(device)

	if weights_path:
		ckpt = torch.load(weights_path, map_location=device)

		# checkpoint may be a full dict or a state_dict
		if isinstance(ckpt, dict):
			# common keys: 'state_dict', 'model_state_dict', or direct state_dict
			if 'state_dict' in ckpt:
				state = ckpt['state_dict']
			elif 'model_state_dict' in ckpt:
				state = ckpt['model_state_dict']
			elif 'model' in ckpt and isinstance(ckpt['model'], dict):
				state = ckpt['model']
			else:
				state = ckpt
		else:
			state = ckpt

		# remove 'module.' prefixes if present (DataParallel)
		def _strip_module_prefix(sd):
			new_sd = OrderedDict()
			for k, v in sd.items():
				new_k = k.replace('module.', '') if k.startswith('module.') else k
				new_sd[new_k] = v
			return new_sd

		if isinstance(state, dict):
			try:
				model.load_state_dict(_strip_module_prefix(state))
			except RuntimeError:
				# maybe the state is nested (e.g., contains optimizer etc.)
				# try to find a best candidate
				candidate = None
				for key in ('state_dict', 'model_state_dict', 'model'):
					if key in state and isinstance(state[key], dict):
						candidate = state[key]
						break
				if candidate is not None:
					model.load_state_dict(_strip_module_prefix(candidate))
				else:
					raise
		else:
			raise TypeError('Unexpected checkpoint type: {}'.format(type(state)))

	model.eval()
	return model

__all__ = ['CNN', 'load_model']

