<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                xmlns:scalar="http://vectorsdev.usc.edu/scalar/elements/1.0/"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:dcterms="http://purl.org/dc/terms/"
                xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
                xmlns:sioc="http://rdfs.org/sioc/ns#">  
                            
    <!-- Internet Archive import XSL version 2.0 by Craig Dietrich -->                        
  
  	<!-- Variales -->
  
   	<xsl:variable name="archiveName">
		<xsl:text>Internet Archive</xsl:text>
	</xsl:variable>    
  
 	<xsl:variable name="resourceBase">
		<xsl:text>http://www.archive.org/details/</xsl:text>
	</xsl:variable>  
  
 	<xsl:variable name="downloadBase">
		<xsl:text>http://www.archive.org/download/</xsl:text>
	</xsl:variable>    
  
  	<!-- Templates -->
  
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="/response/result/doc" />
		</rdf:RDF>		
	</xsl:template>  
	
	<xsl:template match="/response/result/doc">	
		<rdf:Description rdf:about="{$resourceBase}{str[@name='identifier']}">
			<dcterms:source><xsl:value-of select="$archiveName"/></dcterms:source>
			<xsl:apply-templates>
				<xsl:with-param name="resourceSlug" select="str[@name='identifier']" />
			</xsl:apply-templates>
		</rdf:Description>
	</xsl:template>
	
	<xsl:template match="*"></xsl:template>
 
 	<xsl:template match="str[@name='title']">
  		<dcterms:title><xsl:value-of select="."/></dcterms:title>
	</xsl:template>	
 
 	<xsl:template match="str[@name='description']">
  		<dcterms:description><xsl:value-of select="."/></dcterms:description>
	</xsl:template>

	<xsl:template match="arr[@name='creator']">
  		<dcterms:contributor><xsl:value-of select="."/></dcterms:contributor>
	</xsl:template>

	<xsl:template match="arr[@name='rights']">
  		<dc:rights><xsl:value-of select="."/></dc:rights>
	</xsl:template>       
  
	<xsl:template match="str[@name='identifier']">
  		<dcterms:identifier><xsl:value-of select="."/></dcterms:identifier>
	</xsl:template>    
  
	<xsl:template match="str[@name='mediatype']">
  		<dcterms:type><xsl:value-of select="."/></dcterms:type>
	</xsl:template>     
  
	<xsl:template match="date[@name='publicdate']">
  		<dcterms:date><xsl:value-of select="."/></dcterms:date>
	</xsl:template>       
  
	<xsl:template match="arr[@name='subject']">
  		<xsl:apply-templates select="str" mode="subject-str" />
	</xsl:template>       
  
	<xsl:template match="str" mode="subject-str">
		<dcterms:subject><xsl:value-of select="."/></dcterms:subject>
	</xsl:template>  
  
	<xsl:template match="arr[@name='format']">
		<xsl:param name="resourceSlug" />
		<xsl:apply-templates select="str" mode="format-str">
			<xsl:with-param name="resourceSlug" select="$resourceSlug" />
		</xsl:apply-templates>
	</xsl:template>  
	
	<xsl:template match="str" mode="format-str">
		<!-- Construct the URI of the source media -->
		<xsl:param name="resourceSlug"/>
  		<xsl:variable name="resourceURI">
    		<xsl:value-of select="$downloadBase"/><xsl:value-of select="$resourceSlug"/>/format=<xsl:value-of select="translate(.,' ','+')"/>
  		</xsl:variable>
  		<!-- List as thumbnail or filename -->
  		<xsl:choose>	
			<xsl:when test=".='Thumbnail'"><art:thumbnail rdf:resource="{$resourceURI}"></art:thumbnail></xsl:when>
			<xsl:when test=".='Metadata'"><!-- Not sure where to put this --></xsl:when>
			<xsl:otherwise><art:filename rdf:resource="{$resourceURI}"></art:filename></xsl:otherwise>
		</xsl:choose> 
  		<xsl:choose>	
			<xsl:when test=".='JPEG'"><art:thumbnail rdf:resource="{$resourceURI}"></art:thumbnail></xsl:when>		
		</xsl:choose> 
	</xsl:template>
                
</xsl:stylesheet>                