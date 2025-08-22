// Minimal browser shim for Node 'zlib' to satisfy dicom-parser UMD wrapper
// Note: Deflated transfer syntax (1.2.840.10008.1.2.1.99) is not supported here.
// If you need it, replace these with pako.inflateRaw equivalents.

export function inflateRawSync(buffer) {
	// Return input unchanged as a placeholder. dicom-parser won't call this in browser path
	// unless deflate transfer syntax is used.
	return buffer;
}

export function inflateRaw(buffer) {
	return buffer;
}

export default { inflateRawSync, inflateRaw };


