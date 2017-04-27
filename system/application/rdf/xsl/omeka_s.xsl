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
			<!-- TODO -->
			<art:sourceLocation rdf:resource="" />
			<xsl:apply-templates select="location_data" />
			<xsl:apply-templates select="tags/node" />
			<xsl:apply-templates select="element_texts/child::*" />
		</rdf:Description>
	</xsl:template>

	<xsl:template match="location_data">
		<dcterms:spatial><xsl:value-of select="."/></dcterms:spatial>
	</xsl:template>

	<xsl:template match="tags/node">
		<dcterms:subject><xsl:value-of select="name"/></dcterms:subject>
	</xsl:template>

	<xsl:template match="element_texts/child::*">
		<xsl:choose>
			<xsl:when test="name(.) = 'Title'">
				<dcterms:title><xsl:value-of select="."/></dcterms:title>
			</xsl:when>
			<xsl:when test="name(.) = 'Description'">
				<dcterms:description><xsl:value-of select="."/></dcterms:description>
			</xsl:when>
			<xsl:when test="name(.) = 'Creator'">
				<dcterms:contributor><xsl:value-of select="."/></dcterms:contributor>
			</xsl:when>
			<xsl:when test="name(.) = 'Source'">
				<dcterms:source><xsl:value-of select="."/></dcterms:source>
			</xsl:when>
			<xsl:when test="name(.) = 'Date'">
				<dcterms:date><xsl:value-of select="."/></dcterms:date>
			</xsl:when>
			<xsl:when test="name(.) = 'Coverage'">
				<dcterms:coverage><xsl:value-of select="."/></dcterms:coverage>
			</xsl:when>
		</xsl:choose>
	</xsl:template>

</xsl:stylesheet>
