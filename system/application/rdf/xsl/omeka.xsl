<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
				xmlns:base="http://example.com/"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                xmlns:scalar="http://vectorsdev.usc.edu/scalar/elements/1.0/"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:dcterms="http://purl.org/dc/terms/"
                xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
                xmlns:sioc="http://rdfs.org/sioc/ns#">  
                            
    <!-- Omeka installs import XSL version 1.0 by Craig Dietrich -->  
    <!-- Makes use of omeka_to_json.php -->                       
                            
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="root/node" />
		</rdf:RDF>		
	</xsl:template>  

	<xsl:template match="*"></xsl:template>
	
	<xsl:template match="root/node">		
		<rdf:Description rdf:about="http://{file_data/archive}/items/show/{id}">
			<dcterms:source><xsl:value-of select="file_data/archive" /></dcterms:source>
			<art:filename rdf:resource="{file_data/url}" />
			<art:thumbnail rdf:resource="{file_data/thumb}" />
			<dcterms:identifier><xsl:value-of select="file_data/filename"/></dcterms:identifier>
			<art:sourceLocation rdf:resource="http://{file_data/archive}/items/show/{id}" />
			<xsl:apply-templates select="location_data" />
			<xsl:apply-templates select="tags/node" />
			<xsl:apply-templates select="element_texts/node" />
		</rdf:Description>		
	</xsl:template>	
	
	<xsl:template match="location_data">
		<dcterms:spatial><xsl:value-of select="."/></dcterms:spatial>
	</xsl:template>		
	
	<xsl:template match="tags/node">
		<dcterms:subject><xsl:value-of select="name"/></dcterms:subject>
	</xsl:template>	
	
	<xsl:template match="element_texts/node">
		<xsl:choose>
			<xsl:when test="element/name = 'Title'">
				<dcterms:title><xsl:value-of select="text"/></dcterms:title>
			</xsl:when>
			<xsl:when test="element/name = 'Description'">
				<dcterms:description><xsl:value-of select="text"/></dcterms:description>
			</xsl:when>		
			<xsl:when test="element/name = 'Creator'">
				<dcterms:contributor><xsl:value-of select="text"/></dcterms:contributor>
			</xsl:when>				
			<xsl:when test="element/name = 'Source'">
				<dcterms:source><xsl:value-of select="text"/></dcterms:source>
			</xsl:when>		
			<xsl:when test="element/name = 'Date'">
				<dcterms:date><xsl:value-of select="text"/></dcterms:date>
			</xsl:when>			
			<xsl:when test="element/name = 'Coverage'">
				<dcterms:coverage><xsl:value-of select="text"/></dcterms:coverage>
			</xsl:when>								
	  </xsl:choose>
	</xsl:template>		 
                
</xsl:stylesheet>                