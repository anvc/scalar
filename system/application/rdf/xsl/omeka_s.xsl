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
			<xsl:choose>
				<!-- if date exists, it’ll be handled by apply-templates below -->
				<xsl:when test="dctermsdate"/>
				<xsl:when test="ocreated">
					<dcterms:date>
						<xsl:value-of select="ocreated/value"/>
					</dcterms:date>
				</xsl:when>
				<xsl:when test="omodified">
					<dcterms:date>
						<xsl:value-of select="omodified/value"/>
					</dcterms:date>
				</xsl:when>
			</xsl:choose>
			<xsl:choose>
				<xsl:when test="dctermsformat">
					<!-- it’ll be handled by apply-templates -->
					<xsl:if test="not(rdfformat)">
						<rdf:format>
							<xsl:value-of select="dctermsformat/node[1]/value"/>
						</rdf:format>
					</xsl:if>
				</xsl:when>
				<xsl:when test="rdfformat">
					<!-- it’ll be handled by apply-templates -->
					<dcterms:format>
						<xsl:value-of select="rdfformat/node[1]/value"/>
					</dcterms:format>
				</xsl:when>
				<xsl:when test="omedia_type">
					<dcterms:format>
						<xsl:value-of select="omedia_type"/>
					</dcterms:format>
					<rdf:format>
						<xsl:value-of select="omedia_type"/>
					</rdf:format>
				</xsl:when>
			</xsl:choose>
			<xsl:if test="olang and olang != '' and not(dctermslanguage)">
				<dcterms:language>
					<xsl:value-of select="olang"/>
				</dcterms:language>
			</xsl:if>
			<xsl:apply-templates select="*"/>
		</rdf:Description>
	</xsl:template>

	<xsl:template
		match="archive |
			context |
			dctermscreator |
			id |
			oid |
			oingester |
			oispublic |
			oitem |
			olang |
			omedia_type |
			oowner |
			orenderer |
			oresource_class |
			oresource_template |
			osha256 |
			osource"/>

	<xsl:template match="dctermscontributor">
		<dcterms:contributor>
			<xsl:value-of select="node[1]/value"/>
		</dcterms:contributor>
	</xsl:template>

	<xsl:template match="dctermsdate">
		<dcterms:date>
			<xsl:value-of select="node[1]/value"/>
		</dcterms:date>
	</xsl:template>

	<xsl:template match="dctermsdescription">
		<dcterms:description>
			<xsl:value-of select="node[1]/value"/>
		</dcterms:description>
	</xsl:template>

	<xsl:template match="dctermsformat">
		<dcterms:format>
			<xsl:value-of select="node[1]/value"/>
		</dcterms:format>
	</xsl:template>

	<xsl:template match="dctermslanguage">
		<dcterms:language>
			<xsl:value-of select="node[1]/value"/>
		</dcterms:language>
	</xsl:template>

	<xsl:template match="dctermstitle">
		<dcterms:title>
			<xsl:value-of select="node[1]/value"/>
		</dcterms:title>
	</xsl:template>

	<xsl:template match="ocreated">
		<dcterms:created>
			<xsl:value-of select="ocreated/value"/>
		</dcterms:created>
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

	<xsl:template match="rdfformat">
		<rdf:format>
			<xsl:value-of select="node[1]/value"/>
		</rdf:format>
	</xsl:template>

	<xsl:template match="rdftype">
		<rdf:type>
			<xsl:value-of select="."/>
		</rdf:type>
	</xsl:template>

	<xsl:template match="type">
		<xsl:choose>
			<xsl:when test="count(*) = 0">
				<xsl:apply-templates select="." mode="handle-types"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:apply-templates select="node/value" mode="handle-types"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template match="*" mode="handle-types">
		<xsl:if test=". != 'o:Media'">
			<dcterms:type>
				<xsl:value-of select="."/>
			</dcterms:type>
		</xsl:if>
	</xsl:template>
</xsl:stylesheet>
