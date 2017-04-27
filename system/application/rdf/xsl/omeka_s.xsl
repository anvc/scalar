<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
		xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
		xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
		xmlns:scalar="http://vectorsdev.usc.edu/scalar/elements/1.0/"
		xmlns:dc="http://purl.org/dc/elements/1.1/"
		xmlns:dcterms="http://purl.org/dc/terms/"
		xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
		xmlns:sioc="http://rdfs.org/sioc/ns#">

	<!-- Omeka S installs import XSL version 1.0 by Craig Dietrich and Chris Maden -->
	<!-- Makes use of omeka_s.php -->

	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="root/node" />
		</rdf:RDF>
	</xsl:template>

	<xsl:template match="*"></xsl:template>

	<xsl:template match="root/node">
		<rdf:Description rdf:about="{id}">
			<dcterms:source><xsl:value-of select="archive" /></dcterms:source>
			<dcterms:date><xsl:value-of select="ocreated/value" /></dcterms:date>
			<art:filename rdf:resource="{ooriginal_url}" />
			<!-- arbitrary choice of square thumbnail (vs. large or medim) -->
			<art:thumbnail rdf:resource="{othumbnail_urls/square}" />
			<dcterms:identifier><xsl:value-of select="ofilename"/></dcterms:identifier>
		</rdf:Description>
	</xsl:template>
</xsl:stylesheet>
