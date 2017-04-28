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
			<xsl:apply-templates select="root/node"/>
		</rdf:RDF>
	</xsl:template>

	<xsl:template match="*"></xsl:template>

	<xsl:template match="root/node">
		<rdf:Description rdf:about="{id}">
			<xsl:apply-templates select="dctermstitle"/>
			<dcterms:source>
				<xsl:choose>
					<xsl:when test="osource and osource != ''">
						<xsl:value-of select="osource"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="archive"/>
					</xsl:otherwise>
				</xsl:choose>
			</dcterms:source>
			<xsl:apply-templates select="ooriginal_url"/>
			<xsl:apply-templates select="othumbnail_urls"/>
			<xsl:apply-templates select="ofilename"/>
			<xsl:apply-templates select="type"/>
			<xsl:apply-templates select="ocreated"/>
			<xsl:choose>
				<xsl:when test="dctermscreator">
					<dcterms:creator>
						<xsl:value-of select="dctermscreator/node[1]/value"/>
					</dcterms:creator>
				</xsl:when>
				<xsl:when test="dctermscontributor">
					<dcterms:creator>
						<xsl:value-of select="dctermscontributor/node[1]/value"/>
					</dcterms:creator>
				</xsl:when>
			</xsl:choose>
			<xsl:apply-templates select="dctermscontributor"/>
			<xsl:apply-templates select="dctermsdescription"/>
		</rdf:Description>
	</xsl:template>

	<xsl:template match="dctermscontributor">
		<dcterms:contributor>
			<xsl:value-of select="node[1]/value"/>
		</dcterms:contributor>
	</xsl:template>

	<xsl:template match="dctermsdescription">
		<dcterms:description>
			<xsl:value-of select="node[1]/value"/>
		</dcterms:description>
	</xsl:template>

	<xsl:template match="dctermstitle">
		<dcterms:title>
			<xsl:value-of select="node[1]/value"/>
		</dcterms:title>
	</xsl:template>

	<xsl:template match="ocreated">
		<dcterms:date>
			<xsl:value-of select="ocreated/value"/>
		</dcterms:date>
	</xsl:template>

	<xsl:template match="ofilename">
		<dcterms:identifier>
			<xsl:value-of select="."/>
		</dcterms:identifier>
	</xsl:template>

	<xsl:template match="ooriginal_url">
		<art:filename rdf:resource="{.}"/>
	</xsl:template>

	<xsl:template match="othumbnail_urls">
		<art:thumbnail>
			<xsl:attribute name="rdf:resource">
				<xsl:choose>
					<xsl:when test="square">
						<xsl:value-of select="square"/>
					</xsl:when>
					<xsl:when test="medium">
						<xsl:value-of select="medium"/>
					</xsl:when>
					<xsl:when test="large">
						<xsl:value-of select="large"/>
					</xsl:when>
				</xsl:choose>
			</xsl:attribute>
		</art:thumbnail>
	</xsl:template>

	<xsl:template match="type">
		<xsl:choose>
			<xsl:when test="count(*) = 0 and . != 'o:Media'">
				<dcterms:type>
					<xsl:value-of select="."/>
				</dcterms:type>
			</xsl:when>
			<xsl:when test="node[value != 'o:Media']">
				<dcterms:type>
					<xsl:value-of select="node[value != 'o:Media'][1]/value"/>
				</dcterms:type>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>
