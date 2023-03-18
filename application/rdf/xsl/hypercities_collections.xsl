<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                xmlns:scalar="http://vectorsdev.usc.edu/scalar/elements/1.0/"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:dcterms="http://purl.org/dc/terms/"
                xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
                xmlns:sioc="http://rdfs.org/sioc/ns#"
				xmlns:atom="http://www.w3.org/2005/Atom" 
				xmlns:atom_hypercities="http://hypercities.ats.ucla.edu/"
				xmlns:kml="http://www.opengis.net/kml/2.2">  
    
    <!-- HyperCities-KML XSL version 1.0 by Craig Dietrich -->                        
  
  	<!-- Variales -->
  
   	<xsl:variable name="archiveName">
		<xsl:text>HyperCities</xsl:text>
	</xsl:variable>    

   	<xsl:variable name="contentType">
		<xsl:text>HyperCities Collection</xsl:text>
	</xsl:variable>  

 	<xsl:variable name="resourceBase">
		<xsl:text>http://hypercities.ats.ucla.edu/?collections/</xsl:text>
	</xsl:variable>  

  	<!-- Templates -->    
                            
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="//kml:Folder | //kml:NetworkLink" />
		</rdf:RDF>		
	</xsl:template>  

	<xsl:template match="*"></xsl:template>
		
 	<xsl:template match="//kml:Folder | //kml:NetworkLink">	
		<rdf:Description rdf:about="{$resourceBase}{@id}">
			<dcterms:source><xsl:value-of select="$archiveName"/></dcterms:source>
			<dcterms:type><xsl:value-of select="$contentType"/></dcterms:type>
			<art:filename rdf:resource="{$resourceBase}{@id}" />
			<dcterms:title><xsl:value-of select="kml:name"/></dcterms:title>
			<dcterms:description><xsl:value-of select="kml:description"/></dcterms:description>
			<dcterms:contributor><xsl:value-of select="atom_hypercities:author/atom_hypercities:name"/></dcterms:contributor>	
			<xsl:apply-templates select="kml:Folder" mode="sub-folder" />
   			<xsl:if test="name(..)='Folder'"> 
		 		<xsl:call-template name="parent-folder">
      				<xsl:with-param name="id" select="../@id" />
    			</xsl:call-template>
    		</xsl:if>			
		</rdf:Description>
	</xsl:template>		
 
  	<xsl:template match="kml:Folder" mode="sub-folder">	
		<dcterms:hasPart rdf:resource="{$resourceBase}{@id}"></dcterms:hasPart>
	</xsl:template>	
 
  	<xsl:template name="parent-folder">
  		<xsl:param name="id" /> 
		<dcterms:isPartOf rdf:resource="{$resourceBase}{$id}"></dcterms:isPartOf>
	</xsl:template>	
 
</xsl:stylesheet>                